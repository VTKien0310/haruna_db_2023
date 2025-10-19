<script setup lang="ts">
import { VaButton } from "vuestic-ui";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import router from "@/router.ts";
import { WebpageBookmarkRouteName } from "@/modules/webpage-bookmark/WebpageBookmarkRouter.ts";

const webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();

const navigateToParentDirectory = (): void => {
  router.push({
    name: WebpageBookmarkRouteName.ROOT,
    params: { id: webpageBookmarkDetailStore.currentParentId },
  });
};
</script>

<template>
  <div
    class="m-1 ml-3 flex flex-row content-center items-center justify-between"
  >
    <p class="">{{ webpageBookmarkDetailStore.webpageBookmark?.name }}</p>
    <div class="flex flex-row content-center items-center justify-end">
      <va-button
        @click="navigateToParentDirectory"
        :disabled="webpageBookmarkDetailStore.currentIsRoot"
        icon="move_up"
        preset="secondary"
        border-color="primary"
      />
    </div>
  </div>
</template>

<style scoped></style>
