<script setup lang="ts">
import {useRoute} from 'vue-router';
import {computed, onMounted, ref, type StyleValue, watch} from 'vue';
import {type Media, MediaTypeEnum} from '@/modules/gallery/GalleryEntities';
import type {Profile} from '@/modules/auth/ProfileEntities';
import {IonPage} from '@ionic/vue';
import {
  useGalleryListService,
  useGalleryNavigationService,
  useMediaDetailService,
} from '@/modules/gallery/GalleryServiceContainer';
import {usePointerSwipe, useSwipe, type UseSwipeDirection} from '@vueuse/core';
import {useAuthStore} from '@/modules/auth/stores/AuthStore';
import {createAnimation, type Animation} from '@ionic/vue';

const media = ref<Media | null>(null)
const mediaSignedUrl = ref<string>('')

const mediaDetailService = useMediaDetailService();

const showMediaDetail = ref<boolean>(false)
const triggerShowMediaDetail = (): void => {
  showMediaDetail.value = !showMediaDetail.value
}

const isHandlingDeleteMedia = ref<boolean>(false)
const deleteMedia = (): void => {
  isHandlingDeleteMedia.value = true
  mediaDetailService.deleteMedia(media.value!).then(
      () => isHandlingDeleteMedia.value = false
  )
}

const isHandlingDownloadMedia = ref<boolean>(false)
const downloadMedia = (): void => {
  isHandlingDownloadMedia.value = true
  mediaDetailService.downloadMedia(media.value!).then(
      () => isHandlingDownloadMedia.value = false
  )
}

const showProgressBar = computed((): boolean => {
  return media.value == null
      || mediaSignedUrl.value == ''
      || isHandlingDeleteMedia.value
      || isHandlingDownloadMedia.value
})

const mediaUploader = ref<Profile | null>(null)

const uploaderIsMe = ref<boolean>(false)

const mediaIsVideo = computed((): boolean => media.value?.type === MediaTypeEnum.VIDEO)

const pageBackground = computed((): StyleValue => {
  return media.value?.type === MediaTypeEnum.PHOTO
      ? {'background-image': 'url(' + mediaSignedUrl.value + ')'}
      : {}
})

const mediaDisplayArea = ref(null);
const prevMediaId = ref<string | null>(null);
const nextMediaId = ref<string | null>(null);
const galleryNavigationService = useGalleryNavigationService();
let navigateToNextMediaAnimation: Animation;
let navigateToPrevMediaAnimation: Animation;
const registerNavigateAnimation = () => {
  navigateToPrevMediaAnimation = createAnimation().
      addElement(mediaDisplayArea.value!).
      duration(500).
      fromTo('transform', 'translateX(0px)', 'translateX(100px)').
      fromTo('opacity', '1', '0.2');

  navigateToNextMediaAnimation = createAnimation().
      addElement(mediaDisplayArea.value!).
      duration(500).
      fromTo('transform', 'translateX(0px)', 'translateX(-100px)').
      fromTo('opacity', '1', '0.2');
}
const navigateToAdjacentMedia = (direction: UseSwipeDirection) => {
  if (direction === 'right') {
    navigateToPrevMediaAnimation.play().then(() => {
      if (prevMediaId.value) {
        galleryNavigationService.replaceMediaDetailPage(prevMediaId.value);
      }
      navigateToPrevMediaAnimation.stop();
    });
    return;
  }

  if (direction === 'left') {
    navigateToNextMediaAnimation.play().then(() => {
      if (nextMediaId.value) {
        galleryNavigationService.replaceMediaDetailPage(nextMediaId.value);
      }
      navigateToNextMediaAnimation.stop();
    });
    return;
  }
};
// for mobile browser
useSwipe(mediaDisplayArea, {
  onSwipeEnd(e, direction) {
    navigateToAdjacentMedia(direction);
  },
});
// for desktop browser
usePointerSwipe(mediaDisplayArea, {
  onSwipeEnd(e, direction) {
    navigateToAdjacentMedia(direction);
  },
});

const route = useRoute();
const galleryListService = useGalleryListService();
const authStore = useAuthStore();
const fetchMediaDetailPageData = async () => {
  if (!(typeof route.query.file === 'string')) {
    return
  }

  media.value = await mediaDetailService.getMediaById(route.query.file);
  if (!media.value){
    return;
  }

  mediaSignedUrl.value = await mediaDetailService.createFullSizeViewUrlForMedia(media.value!);

  const uploader = await mediaDetailService.getMediaUploader(media.value!);
  mediaUploader.value = uploader;

  uploaderIsMe.value = !!uploader && uploader.user_id === authStore.profile?.user_id;

  ({prevId: prevMediaId.value, nextId: nextMediaId.value} = await galleryListService.getPrevAndNextMediaIdInList(
      media.value!,
  ));
};

watch(() => route.query.file, fetchMediaDetailPageData);
// onIonViewDidEnter() is not used here since we only want to load the data once
// using it will load the data again when this page is re-opened
onMounted(() => {
  registerNavigateAnimation();
  fetchMediaDetailPageData();
});
</script>

<template>
  <ion-page>
    <div
        ref="mediaDisplayArea"
        :style="pageBackground"
        class="h-screen bg-center bg-contain bg-scroll bg-no-repeat"
    >
      <va-progress-bar v-show="showProgressBar" indeterminate/>

      <div
          v-if="mediaIsVideo"
          class="h-full w-full flex flex-col justify-center content-center items-center"
      >
        <video :src="mediaSignedUrl" class="max-w-full h-auto max-h-full" controls/>
      </div>

      <div
          class="interaction-area h-1/6 w-1/2 sm:w-1/3 md:w-1/6 lg:w-1/12 flex flex-col justify-end content-center items-center fixed bottom-12 right-3">

        <div
            :class="{'detail-area':showMediaDetail}"
            class="flex flex-col justify-start content-start items-start p-3 mb-3 w-full h-full"
        >
          <div v-show="showMediaDetail">
            <p>By {{ mediaUploader?.name ?? '' }}</p>
            <p>On {{ media ? mediaDetailService.transformMediaCreatedAtToHumanReadableFormat(media) : '' }}</p>
            <p>Size {{ mediaDetailService.transformMediaSizeToHumanReadableFormat(media?.size ?? 0) }}</p>
          </div>
        </div>

        <div class="flex flex-row justify-end content-center items-center w-full">
          <va-button @click="triggerShowMediaDetail" round icon="info" class="mr-1"/>
          <va-button @click="downloadMedia" round icon="download" class="mr-1"/>
          <va-button v-if="uploaderIsMe" @click="deleteMedia" round icon="delete" color="danger"/>
        </div>

      </div>

    </div>
  </ion-page>
</template>

<style scoped>
.interaction-area {
  height: 15vh;
}

.detail-area {
  background-color: var(--va-background-border);
  border-radius: 20px;
}
</style>
