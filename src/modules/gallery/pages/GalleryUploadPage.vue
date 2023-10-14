<script setup lang="ts">
import {computed, ref} from "vue";
import {useModal} from "vuestic-ui";
import {useGalleryStore} from "@/modules/gallery/GalleryStore";
import router from "@/router";
import {GalleryRouteName} from "@/modules/gallery/GalleryRouter";

const files = ref<File[]>([])

const isHandlingUpload = ref<boolean>(false)

function turnOnIsHandlingUploadState(): void {
  isHandlingUpload.value = true;
}

function turnOffIsHandlingUploadState(): void {
  isHandlingUpload.value = false;
}

const enableUploadButton = computed((): boolean => {
  return files.value.length > 0 && !isHandlingUpload.value
})

const galleryStore = useGalleryStore();

async function handleUploadFiles(): Promise<File[]> {
  const failedToUploadFiles: File[] = [];

  for (const file of files.value) {
    const fileUploadResult = await galleryStore.uploadMedia(file);
    if (!fileUploadResult) {
      failedToUploadFiles.push(file)
    }
  }

  return failedToUploadFiles;
}

function redirectToGalleryListIfHasNoUploadError(): void {
  if (files.value.length === 0) {
    router.push({
      name: GalleryRouteName.LIST
    })
  }
}

const {confirm} = useModal();

function onUploadButtonClick(): void {
  confirm(`Proceed to upload ${files.value.length} file(s)?`).then(
      async (confirmation: boolean) => {
        if (!confirmation) {
          return;
        }

        turnOnIsHandlingUploadState();
        files.value = await handleUploadFiles();
        turnOffIsHandlingUploadState();
        redirectToGalleryListIfHasNoUploadError();
      }
  )
}
</script>

<template>

  <va-file-upload
      :disabled="isHandlingUpload"
      v-model="files"
      file-types="image/*"
      type="gallery"
      dropzone
      upload-button-text="Add"
      dropZoneText="Add files or drop them here"
  />

  <div class="w-full flex flex-row justify-center content-center items-center mt-5">
    <va-button
        @click="onUploadButtonClick"
        :loading="isHandlingUpload"
        :disabled="!enableUploadButton"
    >
      Upload
    </va-button>
  </div>

</template>

<style scoped>

</style>