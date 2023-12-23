<script setup lang="ts">
import {useRoute} from "vue-router";
import {computed, onMounted, ref} from "vue";
import {useMediaStore} from "@/modules/gallery/stores/MediaStore";
import type {Media} from "@/modules/gallery/GalleryEntities";
import type {Profile} from "@/modules/auth/ProfileEntities";

const media = ref<Media | null>(null)
const mediaSignedUrl = ref<string>('')

const route = useRoute();

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

onMounted(async () => {
  if (!(typeof route.params.id === 'string')) {
    return
  }

  media.value = await mediaStore.getMediaById(route.params.id)
  mediaSignedUrl.value = await mediaStore.createFullSizeViewUrlForMedia(media.value!)
  mediaUploader.value = await mediaStore.getMediaUploader(media.value!)
})
</script>

<template>
  <div
      :style="{ 'background-image': 'url('+mediaSignedUrl+')' }"
      class="h-screen bg-center bg-contain bg-scroll bg-no-repeat"
  >
    <va-progress-bar v-show="showProgressBar" indeterminate/>

    <div
        class="interaction-area h-1/6 w-1/2 sm:w-1/3 md:w-1/6 lg:w-1/12 flex flex-col justify-end content-center items-center fixed bottom-12 right-3">

      <div
          :class="{'detail-area':showMediaDetail}"
          class="flex flex-col justify-start content-start items-start p-3 mb-3 w-full h-full"
      >
        <div v-show="showMediaDetail">
          <p>By {{ mediaUploader?.name ?? '' }}</p>
          <p>On {{ media ? mediaStore.transformMediaCreatedAtToReadableFormat(media) : '' }}</p>
          <p>Size {{ mediaStore.transformMediaSizeToReadableFormat(media?.size ?? 0) }}</p>
        </div>
      </div>

      <div class="flex flex-row justify-end content-center items-center w-full">
        <va-button @click="triggerShowMediaDetail" round icon="info" class="mr-1"/>
        <va-button @click="downloadMedia" round icon="download" class="mr-1"/>
        <va-button @click="deleteMedia" round icon="delete" color="danger"/>
      </div>

    </div>

  </div>
</template>

<style scoped>
.interaction-area {
  height: 15vh;
}

.detail-area {
  background-color: var(--va-background-border);
  border-radius: 20px;
}

.te {
  background-color: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}
</style>