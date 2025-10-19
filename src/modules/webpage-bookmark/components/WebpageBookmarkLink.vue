<script setup lang="ts">
import { VaButton, VaInput, VaTextarea } from "vuestic-ui";
import WebpageBookmarkDirectoryHeader from "@/modules/webpage-bookmark/components/WebpageBookmarkDirectoryHeader.vue";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import { useToastService } from "@/modules/master/MasterServiceContainer.ts";
import { useDeleteWebpageBookmarkService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";
import UpdateWebpageBookmarkLinkForm from "@/modules/webpage-bookmark/components/UpdateWebpageBookmarkLinkForm.vue";

const webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();

const deleteWebpageBookmarkService = useDeleteWebpageBookmarkService();

const deleteLink = (): void => {
  deleteWebpageBookmarkService.deleteWebpageBookmarkLink(
    webpageBookmarkDetailStore.webpageBookmark!,
  );
};

const toastService = useToastService();
const copyUrl = (): void => {
  if (!webpageBookmarkDetailStore.webpageBookmark) return;
  navigator.clipboard.writeText(webpageBookmarkDetailStore.webpageBookmark.url);
  toastService.info("Link copied to clipboard");
};

const openUrl = (): void => {
  window.open(webpageBookmarkDetailStore.webpageBookmark?.url, "_blank");
};
</script>

<template>
  <div class="relative w-full">
    <div class="grid h-full grid-flow-row grid-cols-1 grid-rows-16 gap-2 pb-10">
      <WebpageBookmarkDirectoryHeader class="row-span-1 self-start" />

      <va-input
        :model-value="webpageBookmarkDetailStore.webpageBookmark?.url ?? ''"
        readonly
        class="row-span-1 h-full w-full self-center px-2"
      />

      <va-textarea
        :model-value="
          webpageBookmarkDetailStore.webpageBookmark?.description ?? ''
        "
        readonly
        :resize="false"
        class="row-span-3 h-full w-full self-center px-2"
      />

      <div
        class="row-span-1 flex w-full flex-row content-center items-center justify-between px-2 md:justify-center lg:justify-center xl:justify-center"
      >
        <va-button
          @click="copyUrl"
          icon="content_copy"
          preset="secondary"
          border-color="primary"
          class="mr-1 w-full md:w-1/4 lg:w-1/6 xl:w-1/6"
        />
        <va-button
          @click="openUrl"
          icon="open_in_new"
          preset="secondary"
          border-color="primary"
          class="ml-1 w-full md:w-1/4 lg:w-1/6 xl:w-1/6"
        />
      </div>
    </div>

    <div
      class="absolute right-1 bottom-10 flex flex-col content-center items-center justify-around"
    >
      <UpdateWebpageBookmarkLinkForm/>
      <va-button
        @click="deleteLink"
        icon="delete"
        round
        class="m-1"
        color="danger"
      />
    </div>
  </div>
</template>

<style scoped></style>
