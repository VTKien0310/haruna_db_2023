<script setup lang="ts">
import { IonPage } from "@ionic/vue";
import WebpageBookmarkDirectoryHeader from "@/modules/webpage-bookmark/components/WebpageBookmarkDirectoryHeader.vue";
import {
  makeVirtualWebBookmarkRootDirectory,
  type WebpageBookmark,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import { useAuthStore } from "@/modules/auth/stores/AuthStore.ts";

const authStore = useAuthStore();

const virtualRootWebBookmarkDir: WebpageBookmark =
  makeVirtualWebBookmarkRootDirectory(authStore.profile?.user_id ?? "");
</script>

<template>
  <ion-page>
    <WebpageBookmarkDirectoryHeader
      :webpage-bookmark="virtualRootWebBookmarkDir"
    />
  </ion-page>
</template>

<style scoped></style>
