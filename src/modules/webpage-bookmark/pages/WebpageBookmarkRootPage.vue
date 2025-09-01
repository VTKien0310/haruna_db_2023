<script setup lang="ts">
import { IonPage } from "@ionic/vue";
import { makeVirtualWebBookmarkRootDirectory } from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import { useAuthStore } from "@/modules/auth/stores/AuthStore.ts";
import WebpageBookmarkDirectory from "@/modules/webpage-bookmark/components/WebpageBookmarkDirectory.vue";

const authStore = useAuthStore();

// since the root directory is not stored in the database, we create a virtual one here
const virtualWebBookmarkRootDir = makeVirtualWebBookmarkRootDirectory(
  authStore.profile?.user_id ?? "",
);
</script>

<template>
  <ion-page>
    <WebpageBookmarkDirectory :webpage-bookmark="virtualWebBookmarkRootDir" />
  </ion-page>
</template>

<style scoped></style>
