<script setup lang="ts">
import router from "@/router";
import {GalleryRouteName} from "@/modules/gallery/GalleryRouter";

function goToGalleryUploadPage(): void {
  router.push({name: GalleryRouteName.UPLOAD})
}
</script>

<template>
  <va-button
      @click="goToGalleryUploadPage"
      round
      size="large"
      icon="upload"
  />
</template>

<style scoped>

</style>