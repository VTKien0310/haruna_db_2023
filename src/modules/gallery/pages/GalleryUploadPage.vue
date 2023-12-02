<script setup lang="ts">
import {useGalleryUploadStore} from "@/modules/gallery/stores/GalleryUploadStore";

const galleryUploadStore = useGalleryUploadStore();
</script>

<template>

  <va-file-upload
      :disabled="galleryUploadStore.isHandlingCreateNewMedia"
      v-model="galleryUploadStore.pendingNewMediaFiles"
      file-types="image/*"
      type="gallery"
      dropzone
      upload-button-text="Add"
      dropZoneText="Add files or drop them here"
  />

  <div class="w-full flex flex-row justify-center content-center items-center mt-5">
    <va-button
        @click="galleryUploadStore.uploadPendingNewMediaFiles"
        :loading="galleryUploadStore.isHandlingCreateNewMedia"
        :disabled="galleryUploadStore.pendingNewMediaFiles.length === 0 || galleryUploadStore.isHandlingCreateNewMedia"
    >
      Upload
    </va-button>
  </div>

</template>

<style scoped>

</style>