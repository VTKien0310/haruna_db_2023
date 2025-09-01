<script setup lang="ts">
import { VaTextarea } from "vuestic-ui";
import WebpageBookmarkDirectoryHeader from "@/modules/webpage-bookmark/components/WebpageBookmarkDirectoryHeader.vue";
import {
  WEB_BOOKMARK_ROOT_DIR_ID,
  type WebpageBookmark,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";

const props = defineProps<{
  webpageBookmark: WebpageBookmark;
}>();

const isRootDirectory = props.webpageBookmark.id === WEB_BOOKMARK_ROOT_DIR_ID;
</script>

<template>
  <div class="grid h-full grid-flow-row grid-cols-1 grid-rows-16 gap-2 pb-10">
    <WebpageBookmarkDirectoryHeader
      :webpage-bookmark="webpageBookmark"
      class="row-span-1 self-start"
    />

    <va-textarea
      v-if="!isRootDirectory"
      v-model="webpageBookmark.description"
      readonly
      class="row-span-3 h-full w-full self-center px-2"
    />

    <div
      :class="[isRootDirectory ? 'row-span-15' : 'row-span-12']"
      class="overflow-y-auto px-2"
    >
      <p v-for="i in 100">Placeholder content {{ i }}</p>
    </div>
  </div>
</template>

<style scoped></style>
