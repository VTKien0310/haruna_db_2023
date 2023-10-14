<script setup lang="ts">
import {useGalleryStore} from "@/modules/gallery/GalleryStore";

const galleryStore = useGalleryStore();
</script>

<template>

  <va-file-upload
      :disabled="galleryStore.isHandlingCreateNewMedia"
      v-model="galleryStore.pendingNewMediaFiles"
      file-types="image/*"
      type="gallery"
      dropzone
      upload-button-text="Add"
      dropZoneText="Add files or drop them here"
  />

  <div class="w-full flex flex-row justify-center content-center items-center mt-5">
    <va-button
        @click="galleryStore.uploadPendingNewMediaFiles"
        :loading="galleryStore.isHandlingCreateNewMedia"
        :disabled="galleryStore.pendingNewMediaFiles.length === 0 || galleryStore.isHandlingCreateNewMedia"
    >
      Upload
    </va-button>
  </div>

</template>

<style scoped>

</style>