<script setup lang="ts">
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import router from "@/router.ts";
import { WebpageBookmarkRouteName } from "@/modules/webpage-bookmark/WebpageBookmarkRouter.ts";
import { VaButton } from "vuestic-ui";

const webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();

const navigateToParentDirectory = (): void => {
  router.push({
    name: WebpageBookmarkRouteName.ROOT,
    params: { id: webpageBookmarkDetailStore.currentParentId },
  });
};
</script>

<template>
  <va-button
    @click="navigateToParentDirectory"
    :disabled="webpageBookmarkDetailStore.currentIsRoot"
    round
    icon="move_up"
    class="m-1"
    preset="secondary"
    border-color="primary"
  />
</template>

<style scoped></style>
