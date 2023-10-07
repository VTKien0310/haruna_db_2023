<script setup lang="ts">
import router from "@/router";
import {GalleryRouteName} from "@/modules/gallery/GalleryRouter";

function goToGalleryUploadPage(): void {
  router.push({name: GalleryRouteName.UPLOAD})
}
</script>

<template>
  <va-button
      round
      size="large"
      icon="upload"
      @click="goToGalleryUploadPage"
  />
</template>

<style scoped>

</style>