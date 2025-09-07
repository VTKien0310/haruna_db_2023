<script setup lang="ts">
import { VaButton, VaTextarea } from "vuestic-ui";
import WebpageBookmarkDirectoryHeader from "@/modules/webpage-bookmark/components/WebpageBookmarkDirectoryHeader.vue";
import CreateWebpageBookmarkDirectoryForm from "@/modules/webpage-bookmark/components/CreateWebpageBookmarkDirectoryForm.vue";
import CreateWebpageBookmarkLinkForm from "@/modules/webpage-bookmark/components/CreateWebpageBookmarkLinkForm.vue";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";

const webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();
</script>

<template>
  <div class="relative w-full">
    <div class="grid h-full grid-flow-row grid-cols-1 grid-rows-16 gap-2 pb-10">
      <WebpageBookmarkDirectoryHeader class="row-span-1 self-start" />

      <va-textarea
        v-if="!webpageBookmarkDetailStore.currentRecordIsRoot"
        :model-value="
          webpageBookmarkDetailStore.webpageBookmark?.description ?? ''
        "
        readonly
        :resize="false"
        class="row-span-3 h-full w-full self-center px-2"
      />

      <div
        :class="[
          !webpageBookmarkDetailStore.currentRecordIsRoot
            ? 'row-span-12'
            : 'row-span-15',
        ]"
        class="overflow-y-auto px-2"
      >
        <p v-for="i in 100">Placeholder content {{ i }}</p>
      </div>
    </div>

    <div
      class="absolute right-1 bottom-10 flex flex-col content-center items-center justify-around"
    >
      <CreateWebpageBookmarkLinkForm />
      <CreateWebpageBookmarkDirectoryForm />
      <va-button
        v-if="!webpageBookmarkDetailStore.currentRecordIsRoot"
        icon="edit"
        round
        class="m-1"
      />
      <va-button
        v-if="!webpageBookmarkDetailStore.currentRecordIsRoot"
        icon="delete"
        round
        class="m-1"
        color="danger"
      />
    </div>
  </div>
</template>

<style scoped></style>
