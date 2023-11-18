<script setup lang="ts">
import {useRoute} from "vue-router";
import {computed, onMounted, ref} from "vue";
import {useMediaStore} from "@/modules/gallery/stores/MediaStore";
import type {Media} from "@/modules/gallery/GalleryEntities";

const media = ref<Media | null>(null)
const mediaSignedUrl = ref<string>('')

const route = useRoute();

const mediaStore = useMediaStore();

const showProgressBar = computed((): boolean => {
  return mediaSignedUrl.value == ''
      || mediaStore.isHandlingDeleteMedia
      || mediaStore.isHandlingDownloadMedia
})

onMounted(async () => {
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

    <div class="flex flex-col justify-end content-center items-center fixed bottom-12 right-3">
      <va-button @click="mediaStore.downloadMedia(media!)" round icon="download" class="mb-1"/>
      <va-button @click="mediaStore.deleteMedia(media!)" round icon="delete" color="danger"/>
    </div>

  </div>
</template>

<style scoped>

</style>