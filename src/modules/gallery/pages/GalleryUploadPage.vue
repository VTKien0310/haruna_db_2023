<script setup lang="ts">
import {useGalleryUploadStore} from "@/modules/gallery/stores/GalleryUploadStore";
import {IonPage} from "@ionic/vue";

const galleryUploadStore = useGalleryUploadStore();
</script>

<template>
  <ion-page>
    <div>
      <div class="w-full flex flex-row justify-between content-center items-center mt-3 px-1">

        <va-switch
            v-model="galleryUploadStore.isImageUploadMode"
            off-color="primary"
            style="--va-switch-checker-background-color: #ffffff;"
            class="w-1/4"
        >
          <template #innerLabel>
            <div class="va-text-center">
              <va-icon :name="galleryUploadStore.isImageUploadMode ? 'image' : 'videocam'"/>
            </div>
          </template>
        </va-switch>

        <va-button
            @click="galleryUploadStore.uploadPendingNewMediaFiles"
            :loading="galleryUploadStore.isHandlingCreateNewMedia"
            :disabled="galleryUploadStore.pendingNewMediaFiles.length === 0 || galleryUploadStore.isHandlingCreateNewMedia"
            class="w-1/4"
        >
          Upload
        </va-button>

      </div>

      <va-file-upload
          :disabled="galleryUploadStore.isHandlingCreateNewMedia"
          v-model="galleryUploadStore.pendingNewMediaFiles"
          :file-types="galleryUploadStore.isImageUploadMode ? 'image/*' : 'video/*'"
          type="gallery"
          dropzone
          upload-button-text="Add"
          dropZoneText="Add files or drop them here"
      />
    </div>
  </ion-page>
</template>

<style scoped>

</style>