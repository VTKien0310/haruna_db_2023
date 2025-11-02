<script setup lang="ts">
import { VaButton, VaTextarea } from "vuestic-ui";
import WebpageBookmarkDirectoryHeader from "@/modules/webpage-bookmark/components/WebpageBookmarkDirectoryHeader.vue";
import CreateWebpageBookmarkDirectoryForm from "@/modules/webpage-bookmark/components/CreateWebpageBookmarkDirectoryForm.vue";
import CreateWebpageBookmarkLinkForm from "@/modules/webpage-bookmark/components/CreateWebpageBookmarkLinkForm.vue";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import WebpageBookmarkChild from "@/modules/webpage-bookmark/components/WebpageBookmarkChild.vue";
import { useDeleteWebpageBookmarkService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";
import UpdateWebpageBookmarkDirectoryForm from "@/modules/webpage-bookmark/components/UpdateWebpageBookmarkDirectoryForm.vue";
import NavigateToParentBookmarkDirectoryBtn from "@/modules/webpage-bookmark/components/NavigateToParentBookmarkDirectoryBtn.vue";

const webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();

const deleteWebpageBookmarkService = useDeleteWebpageBookmarkService();

const deleteDirectory = (): void => {
  deleteWebpageBookmarkService.deleteWebpageBookmarkDirectory(
    webpageBookmarkDetailStore.webpageBookmark!,
  );
};
</script>

<template>
  <div class="relative w-full">
    <div class="grid h-full grid-flow-row grid-cols-1 grid-rows-16 gap-2 pb-10">
      <WebpageBookmarkDirectoryHeader class="row-span-1 self-start" />

      <va-textarea
        v-if="!webpageBookmarkDetailStore.currentIsRoot"
        :model-value="
          webpageBookmarkDetailStore.webpageBookmark?.description ?? ''
        "
        readonly
        :resize="false"
        class="row-span-3 h-full w-full self-center px-2"
      />

      <div
        :class="[
          !webpageBookmarkDetailStore.currentIsRoot
            ? 'row-span-12'
            : 'row-span-15',
        ]"
        class="overflow-x-clip overflow-y-auto px-2"
      >
        <WebpageBookmarkChild
          v-for="child in webpageBookmarkDetailStore.webpageBookmarkChildren"
          :key="child.id"
          :webpage-bookmark="child"
        />
      </div>
    </div>

    <div
      class="absolute right-1 bottom-10 flex flex-col content-center items-center justify-around"
    >
      <CreateWebpageBookmarkLinkForm />
      <CreateWebpageBookmarkDirectoryForm />
      <UpdateWebpageBookmarkDirectoryForm
        v-if="!webpageBookmarkDetailStore.currentIsRoot"
      />
      <va-button
        v-if="!webpageBookmarkDetailStore.currentIsRoot"
        @click="deleteDirectory"
        icon="delete"
        round
        class="m-1"
        color="danger"
      />
      <NavigateToParentBookmarkDirectoryBtn />
    </div>
  </div>
</template>

<style scoped></style>
