<script setup lang="ts">
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import router from "@/router.ts";
import { WebpageBookmarkRouteName } from "@/modules/webpage-bookmark/WebpageBookmarkRouter.ts";
import { HButton } from "@/libs/ui";

const webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();

const navigateToParentDirectory = (): void => {
  router.push({
    name: WebpageBookmarkRouteName.ROOT,
    params: { id: webpageBookmarkDetailStore.currentParentId },
  });
};
</script>

<template>
  <h-button
    @click="navigateToParentDirectory"
    :disabled="webpageBookmarkDetailStore.currentIsRoot"
    icon="move_up"
    class="m-1"
    variant="outlined"
  />
</template>

<style scoped></style>
