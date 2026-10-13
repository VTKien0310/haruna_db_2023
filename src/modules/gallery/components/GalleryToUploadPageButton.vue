<script setup lang="ts">
import router from "@/router";
import { GalleryRouteName } from "@/modules/gallery/GalleryRouter";
import { HButton } from "@/libs/ui";

function goToGalleryUploadPage(): void {
  router.push({ name: GalleryRouteName.UPLOAD });
}
</script>

<template>
  <h-button @click="goToGalleryUploadPage" size="large" icon="upload" />
</template>

<style scoped></style>
