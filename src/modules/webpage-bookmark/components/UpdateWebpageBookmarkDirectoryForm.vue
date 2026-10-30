<script setup lang="ts">
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import type { WebBookmarkDirectoryFormData } from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";
import { useUpdateWebpageBookmarkService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";
import WebpageBookmarkDirectoryForm from "@/modules/webpage-bookmark/components/WebpageBookmarkDirectoryForm.vue";
import { t } from "@/modules/webpage-bookmark/locales";

const webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();

const webpageBookmark = webpageBookmarkDetailStore.webpageBookmark;

const initialUpdateDirectoryFormData: WebBookmarkDirectoryFormData = {
  name: webpageBookmark?.name ?? "",
  description: webpageBookmark?.description ?? "",
};

const updateWebpageBookmarkService = useUpdateWebpageBookmarkService();

const onSubmit = (formData: WebBookmarkDirectoryFormData): Promise<boolean> => {
  return updateWebpageBookmarkService.updateWebpageBookmarkDirectory(
    webpageBookmark!,
    formData,
  );
};
</script>

<template>
  <WebpageBookmarkDirectoryForm
    form-icon="edit"
    :form-title="t('updateDirectoryTitle')"
    :form-style-is-primary="true"
    :initial-form-data="initialUpdateDirectoryFormData"
    :on-submit="onSubmit"
    :reset-form-on-submit-success="false"
    :submit-btn-label="t('updateButton')"
  />
</template>

<style scoped></style>
