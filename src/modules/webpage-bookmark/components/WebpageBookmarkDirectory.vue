<script setup lang="ts">
import { VaButton, VaTextarea } from "vuestic-ui";
import WebpageBookmarkDirectoryHeader from "@/modules/webpage-bookmark/components/WebpageBookmarkDirectoryHeader.vue";
import {
  WEB_BOOKMARK_ROOT_DIR_ID,
  type WebpageBookmark,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import CreateWebpageBookmarkDirectoryForm from "@/modules/webpage-bookmark/components/CreateWebpageBookmarkDirectoryForm.vue";
import CreateWebpageBookmarkLinkForm from "@/modules/webpage-bookmark/components/CreateWebpageBookmarkLinkForm.vue";

const props = defineProps<{
  webpageBookmark: WebpageBookmark;
}>();

// for the root directory, there will be some unavailable behaviors and data
const isNotRootDirectory =
  props.webpageBookmark.id !== WEB_BOOKMARK_ROOT_DIR_ID;
</script>

<template>
  <div class="relative h-full w-full">
    <div class="grid h-full grid-flow-row grid-cols-1 grid-rows-16 gap-2 pb-10">
      <WebpageBookmarkDirectoryHeader
        :webpage-bookmark="webpageBookmark"
        class="row-span-1 self-start"
      />

      <va-textarea
        v-if="isNotRootDirectory"
        v-model="webpageBookmark.description"
        readonly
        :resize="false"
        class="row-span-3 h-full w-full self-center px-2"
      />

      <div
        :class="[isNotRootDirectory ? 'row-span-12' : 'row-span-15']"
        class="overflow-y-auto px-2"
      >
        <p v-for="i in 100">Placeholder content {{ i }}</p>
      </div>
    </div>

    <div
      class="absolute right-1 bottom-10 flex flex-col content-center items-center justify-around"
    >
      <CreateWebpageBookmarkLinkForm
        :parent-webpage-bookmark="webpageBookmark"
      />
      <CreateWebpageBookmarkDirectoryForm
        :parent-webpage-bookmark="webpageBookmark"
      />
      <va-button v-if="isNotRootDirectory" icon="edit" round class="m-1" />
      <va-button
        v-if="isNotRootDirectory"
        icon="delete"
        round
        class="m-1"
        color="danger"
      />
    </div>
  </div>
</template>

<style scoped></style>
