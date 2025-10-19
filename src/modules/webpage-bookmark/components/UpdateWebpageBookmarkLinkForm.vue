<script setup lang="ts">
import type { WebBookmarkLinkFormData } from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import WebpageBookmarkLinkForm from "@/modules/webpage-bookmark/components/WebpageBookmarkLinkForm.vue";

const webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();

const webpageBookmark = webpageBookmarkDetailStore.webpageBookmark;

const initialUpdateLinkFormData = {
  name: webpageBookmark?.name ?? "",
  url: webpageBookmark?.url ?? "",
  description: webpageBookmark?.description ?? "",
};

const onSubmit = (formData: WebBookmarkLinkFormData): Promise<boolean> => {
  return Promise.resolve(true);
};
</script>

<template>
  <WebpageBookmarkLinkForm
    form-icon="edit"
    form-title="Update link"
    :form-style-is-primary="true"
    :initial-form-data="initialUpdateLinkFormData"
    :on-submit="onSubmit"
    submit-btn-label="Update"
  />
</template>

<style scoped></style>
