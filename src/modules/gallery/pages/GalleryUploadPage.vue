<script setup lang="ts">
import {ref} from "vue";

const files = ref([])
</script>

<template>
  <va-file-upload
      v-model="files"
      file-types="image/*"
      type="gallery"
      dropzone
      upload-button-text="Add"
      dropZoneText="Add files or drop them here"
  />
</template>

<style scoped>

</style>