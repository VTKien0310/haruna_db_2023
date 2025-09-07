<script setup lang="ts">
import {
  type WebpageBookmark,
  WebpageBookmarkType,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import { VaHover, VaIcon } from "vuestic-ui";
import router from "@/router";
import { WebpageBookmarkRouteName } from "@/modules/webpage-bookmark/WebpageBookmarkRouter.ts";
import { ref } from "vue";

const props = defineProps<{
  webpageBookmark: WebpageBookmark;
}>();

const isDirectory =
  props.webpageBookmark.type === WebpageBookmarkType.DIRECTORY;

const isBeingHovered = ref<boolean>(false);

const navigateToWebpageBookmarkDetailPage = (): void => {
  router.push({
    name: WebpageBookmarkRouteName.ROOT,
    params: { id: props.webpageBookmark.id },
  });
};
</script>

<template>
  <va-hover
    v-model="isBeingHovered"
    @click="navigateToWebpageBookmarkDetailPage"
    class="flex flex-row content-center items-center justify-start rounded-lg"
    :class="{
      hovered: isBeingHovered,
    }"
  >
    <va-icon
      :name="isDirectory ? 'folder' : 'link'"
      size="3rem"
      color="primary"
      class="px-3"
    />
    <p>{{ webpageBookmark.name }}</p>
  </va-hover>
</template>

<style scoped>
.hovered {
  background-color: var(--va-background-element);
  cursor: pointer;
}
</style>
