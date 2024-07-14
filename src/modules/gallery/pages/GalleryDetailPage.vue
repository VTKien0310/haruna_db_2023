<script setup lang="ts">
import {useRoute} from 'vue-router';
import {computed, onMounted, ref, type StyleValue} from 'vue';
import {useMediaStore} from '@/modules/gallery/stores/MediaStore';
import {type Media, MediaTypeEnum} from '@/modules/gallery/GalleryEntities';
import type {Profile} from '@/modules/auth/ProfileEntities';
import {IonPage} from '@ionic/vue';
import {useAuthStore} from '@/modules/auth/stores/AuthStore';
import {useMediaDetailService} from "@/modules/gallery/GalleryServiceContainer";

const media = ref<Media | null>(null)
const mediaSignedUrl = ref<string>('')

const route = useRoute();

const mediaDetailService = useMediaDetailService();

const mediaStore = useMediaStore();

const showMediaDetail = ref<boolean>(false)
const triggerShowMediaDetail = (): void => {
  showMediaDetail.value = !showMediaDetail.value
}

const isHandlingDeleteMedia = ref<boolean>(false)
const deleteMedia = (): void => {
  isHandlingDeleteMedia.value = true
  mediaStore
      .deleteMedia(media.value!)
      .then(() => isHandlingDeleteMedia.value = false)
}

const isHandlingDownloadMedia = ref<boolean>(false)
const downloadMedia = (): void => {
  isHandlingDownloadMedia.value = true
  mediaStore
      .downloadMedia(media.value!)
      .then(() => isHandlingDownloadMedia.value = false)
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

const authStore = useAuthStore();

onMounted(async () => {
  if (!(typeof route.params.id === 'string')) {
    return
  }

  media.value = await mediaStore.getMediaById(route.params.id)
  mediaSignedUrl.value = await mediaStore.createFullSizeViewUrlForMedia(media.value!)

  const uploader = await mediaStore.getMediaUploader(media.value!)
  mediaUploader.value = uploader

  const me = await authStore.me();
  uploaderIsMe.value = uploader?.user_id === me?.id && !!uploader;
})
</script>

<template>
  <ion-page>
    <div
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
