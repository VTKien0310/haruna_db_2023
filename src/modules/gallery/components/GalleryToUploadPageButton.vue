<script setup lang="ts">
import router from "@/router";
import { GalleryRouteName } from "@/modules/gallery/GalleryRouter";
import { VaButton } from "vuestic-ui";

function goToGalleryUploadPage(): void {
  router.push({ name: GalleryRouteName.UPLOAD });
}
</script>

<template>
  <va-button @click="goToGalleryUploadPage" round size="large" icon="upload" />
</template>

<style scoped></style>
