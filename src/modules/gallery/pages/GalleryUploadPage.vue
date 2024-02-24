<script setup lang="ts">
import {useGalleryUploadStore} from "@/modules/gallery/stores/GalleryUploadStore";
import {IonPage} from "@ionic/vue";

const galleryUploadStore = useGalleryUploadStore();
</script>

<template>
  <ion-page>
    <div>

      <va-progress-bar
          v-show="galleryUploadStore.isHandlingCreateNewMedia"
          :model-value="galleryUploadStore.currentProgressUploadedFileCount"
          :max="galleryUploadStore.currentProgressTotalFileCount"
      />

      <div class="w-full flex flex-row justify-center content-center items-center mt-3 px-1">
        <va-button
            @click="galleryUploadStore.uploadPendingNewMediaFiles"
            :loading="galleryUploadStore.isHandlingCreateNewMedia"
            :disabled="galleryUploadStore.pendingNewMediaFiles.length === 0 || galleryUploadStore.isHandlingCreateNewMedia"
        >
          Upload
        </va-button>
      </div>

      <va-file-upload
          :disabled="galleryUploadStore.isHandlingCreateNewMedia"
          v-model="galleryUploadStore.pendingNewMediaFiles"
          file-types="image/*,video/*"
          @file-added="() => galleryUploadStore.filterPendingFilesForValidForUpload()"
          dropzone
          upload-button-text="Add"
          dropZoneText="Add files or drop them here"
      />

    </div>
  </ion-page>
</template>

<style scoped>

</style>
