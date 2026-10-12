<script setup lang="ts">
import { useGalleryUploadStore } from "@/modules/gallery/stores/GalleryUploadStore";
import { IonPage } from "@ionic/vue";
import { useUploadMediaService } from "@/modules/gallery/GalleryServiceContainer";
import { HButton, HFileUpload, HProgressBar } from "@/libs/ui";

const uploadMediaService = useUploadMediaService();

const galleryUploadStore = useGalleryUploadStore();

const newPendingFileAdded = () => {
  uploadMediaService.filterPendingFilesForValidForUpload();
};

const uploadPendingMedia = () => {
  uploadMediaService.uploadPendingNewMediaFiles();
};
</script>

<template>
  <ion-page>
    <div class="h-full overflow-y-auto p-4">
      <h-progress-bar
        v-show="galleryUploadStore.isHandlingCreateNewMedia"
        :model-value="galleryUploadStore.currentProgressUploadedFileCount"
        :max="galleryUploadStore.currentProgressTotalFileCount"
      />

      <div class="mb-4 flex w-full flex-row items-center justify-center">
        <h-button
          @click="uploadPendingMedia"
          :loading="galleryUploadStore.isHandlingCreateNewMedia"
          :disabled="
            galleryUploadStore.pendingNewMediaFiles.length === 0 ||
            galleryUploadStore.isHandlingCreateNewMedia
          "
        >
          Upload
        </h-button>
      </div>

      <h-file-upload
        :disabled="galleryUploadStore.isHandlingCreateNewMedia"
        v-model="galleryUploadStore.pendingNewMediaFiles"
        file-types="image/*,video/*"
        @file-added="newPendingFileAdded"
        dropzone
        upload-button-text="Add"
        dropZoneText="Add files or drop them here"
      />
    </div>
  </ion-page>
</template>

<style scoped></style>
