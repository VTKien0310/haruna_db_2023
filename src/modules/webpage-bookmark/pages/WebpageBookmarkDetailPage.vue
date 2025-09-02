<script setup lang="ts">
import { IonPage } from "@ionic/vue";
import {
  makeVirtualWebBookmarkRootDirectory,
  WEB_BOOKMARK_ROOT_DIR_ID,
  type WebpageBookmark,
  WebpageBookmarkType,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import { useAuthStore } from "@/modules/auth/stores/AuthStore.ts";
import WebpageBookmarkDirectory from "@/modules/webpage-bookmark/components/WebpageBookmarkDirectory.vue";
import { useRoute } from "vue-router";
import { onMounted, ref, watch } from "vue";
import { useWebpageBookmarkDetailService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";

const webpageBookmark = ref<WebpageBookmark | null>(null);

const authStore = useAuthStore();

const route = useRoute();

const webpageBookmarkDetailService = useWebpageBookmarkDetailService();

const fetchWebpageBookmark = async (id: string): Promise<void> => {
  if (id === WEB_BOOKMARK_ROOT_DIR_ID) {
    // since the root directory is not stored in the database, we create a virtual one here
    webpageBookmark.value = makeVirtualWebBookmarkRootDirectory(
      authStore.profile?.user_id ?? "",
    );
    return;
  }

  webpageBookmark.value =
    await webpageBookmarkDetailService.getWebpageBookmark(id);
};

watch(
  () => route.params.id,
  (id) => {
    fetchWebpageBookmark(id as string);
  },
);

onMounted(() => {
  fetchWebpageBookmark(route.params.id as string);
});
</script>

<template>
  <ion-page>
    <WebpageBookmarkDirectory
      v-if="webpageBookmark?.type === WebpageBookmarkType.DIRECTORY"
      :webpage-bookmark="webpageBookmark"
    />
  </ion-page>
</template>

<style scoped></style>
