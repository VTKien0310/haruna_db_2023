<script setup lang="ts">
import { VaButton } from "vuestic-ui";
import type { WebpageBookmark } from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";

defineProps<{
  webpageBookmark: WebpageBookmark;
}>();
</script>

<template>
  <div class="m-1 flex flex-row content-center items-center justify-between">
    <p>{{ webpageBookmark.name }}</p>
    <div class="flex flex-row content-center items-center justify-end">
      <va-button
        :disabled="webpageBookmark.level === 0"
        icon="move_up"
        preset="secondary"
        border-color="primary"
      />
    </div>
  </div>
</template>

<style scoped></style>
