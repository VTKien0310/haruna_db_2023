<script setup lang="ts">
import { VaButton } from "vuestic-ui";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";

const webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();
</script>

<template>
  <div
    class="m-1 ml-3 flex flex-row content-center items-center justify-between"
  >
    <p class="">{{ webpageBookmarkDetailStore.webpageBookmark?.name }}</p>
    <div class="flex flex-row content-center items-center justify-end">
      <va-button
        :disabled="webpageBookmarkDetailStore.currentIsRoot"
        icon="move_up"
        preset="secondary"
        border-color="primary"
      />
    </div>
  </div>
</template>

<style scoped></style>
