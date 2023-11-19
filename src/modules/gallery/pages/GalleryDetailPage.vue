<script setup lang="ts">
import {useRoute} from "vue-router";
import {computed, onMounted, ref} from "vue";
import {useMediaStore} from "@/modules/gallery/stores/MediaStore";
import type {Media} from "@/modules/gallery/GalleryEntities";

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

onMounted(async () => {
  if (!(typeof route.params.id === 'string')) {
    return
  }

  media.value = await mediaStore.getMediaById(route.params.id)
  mediaSignedUrl.value = await mediaStore.createFullSizeViewUrlForMedia(media.value!)
})
</script>

<template>
  <div
      :style="{ 'background-image': 'url('+mediaSignedUrl+')' }"
      class="h-screen bg-center bg-contain bg-scroll bg-no-repeat"
  >
    <va-progress-bar v-show="showProgressBar" indeterminate/>

    <div class="interaction-area flex flex-row justify-between content-start items-start fixed bottom-12 right-3">
      <div v-show="showMediaDetail" class="flex flex-col justify-start content-start items-start p-3 mr-3 w-full h-full bg-zinc-100/50">
        <p>By Ricky</p>
        <p>On 12/12/2023</p>
        <p>Size 5MB</p>
      </div>
      <div class="flex flex-col justify-end content-center items-center">
        <va-button @click="triggerShowMediaDetail" round icon="info" class="mb-1"/>
        <va-button @click="downloadMedia" round icon="download" class="mb-1"/>
        <va-button @click="deleteMedia" round icon="delete" color="danger"/>
      </div>
    </div>

<!--    <div class="flex flex-col justify-end content-center items-center fixed bottom-12 right-3">-->
<!--      <va-button @click="downloadMedia" round icon="download" class="mb-1"/>-->
<!--      <va-button @click="deleteMedia" round icon="delete" color="danger"/>-->
<!--    </div>-->

<!--    <div class="flex flex-col justify-end content-start items-start fixed bottom-12 left-3">-->
<!--      <p>By Ricky</p>-->
<!--      <p>On 12/12/2023</p>-->
<!--      <p>Size 5MB</p>-->
<!--    </div>-->

  </div>
</template>

<style scoped>
.interaction-area {
  height: 15%;
}
</style>