<script setup lang="ts">
import type { WebBookmarkLinkFormData } from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import WebpageBookmarkLinkForm from "@/modules/webpage-bookmark/components/WebpageBookmarkLinkForm.vue";
import { t } from "@/modules/webpage-bookmark/locales";
import { useUpdateWebpageBookmarkService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";

const webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();

const webpageBookmark = webpageBookmarkDetailStore.webpageBookmark;

const initialUpdateLinkFormData: WebBookmarkLinkFormData = {
  name: webpageBookmark?.name ?? "",
  url: webpageBookmark?.url ?? "",
  description: webpageBookmark?.description ?? "",
};

const updateWebpageBookmarkService = useUpdateWebpageBookmarkService();

const onSubmit = (formData: WebBookmarkLinkFormData): Promise<boolean> => {
  return updateWebpageBookmarkService.updateWebpageBookmarkLink(
    webpageBookmark!,
    formData,
  );
};
</script>

<template>
  <WebpageBookmarkLinkForm
    form-icon="edit"
    :form-title="t('elements.updateLinkTitle')"
    :form-style-is-primary="true"
    :initial-form-data="initialUpdateLinkFormData"
    :on-submit="onSubmit"
    :reset-form-on-submit-success="false"
    :submit-btn-label="t('elements.updateButton')"
  />
</template>

<style scoped></style>
