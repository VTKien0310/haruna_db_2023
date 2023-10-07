<script setup lang="ts">
import {computed, ref} from "vue";
import {useModal} from "vuestic-ui";

const files = ref<File[]>([])

const isHandlingUpload = ref<boolean>(false)
const enableUploadButton = computed((): boolean => {
  return files.value.length > 0 && !isHandlingUpload.value
})

const {confirm} = useModal();

function onUploadButtonClick(): void {
  confirm(`Proceed to upload ${files.value.length} file(s)?`).then(
      (confirmation: boolean) => {
        if (confirmation) {
          handleUpload()
        }
      }
  )
}

function onHandleUploadSuccess(): void {
  isHandlingUpload.value = false;
  files.value = []
}

function handleUpload(): void {
  isHandlingUpload.value = true;
  setTimeout(onHandleUploadSuccess, 3000);
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