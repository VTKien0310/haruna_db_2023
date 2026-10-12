<script setup lang="ts">
import { type WebpageBookmark } from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import { HHover, HIcon } from "@/libs/ui";
import router from "@/router";
import { WebpageBookmarkRouteName } from "@/modules/webpage-bookmark/WebpageBookmarkRouter.ts";
import { ref } from "vue";
import { useWebpageBookmarkDetailService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";

const props = defineProps<{
  webpageBookmark: WebpageBookmark;
}>();

const webpageBookmarkDetailService = useWebpageBookmarkDetailService();

const isDirectory =
  webpageBookmarkDetailService.isDirectoryWebpageBookmarkRecord(
    props.webpageBookmark,
  );

const isBeingHovered = ref<boolean>(false);

const navigateToWebpageBookmarkDetailPage = (): void => {
  router.push({
    name: WebpageBookmarkRouteName.ROOT,
    params: { id: props.webpageBookmark.id },
  });
};
</script>

<template>
  <h-hover
    v-model="isBeingHovered"
    @click="navigateToWebpageBookmarkDetailPage"
    class="flex flex-row content-center items-center justify-start gap-3 rounded-lg px-3"
    :class="{
      hovered: isBeingHovered,
    }"
  >
    <h-icon
      :name="isDirectory ? 'folder' : 'link'"
      size="3rem"
      color="primary"
    />
    <p class="min-w-0 flex-1 wrap-anywhere">{{ webpageBookmark.name }}</p>
  </h-hover>
</template>

<style scoped>
.hovered {
  background-color: var(--color-background-element);
  cursor: pointer;
}
</style>
