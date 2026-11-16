<script setup lang="ts">
import { useCreateWebpageBookmarkService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";
import WebpageBookmarkLinkForm from "@/modules/webpage-bookmark/components/WebpageBookmarkLinkForm.vue";
import type { WebBookmarkLinkFormData } from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";
import { t } from "@/modules/webpage-bookmark/locales";

const initialCreateLinkFormData: WebBookmarkLinkFormData = {
  name: "",
  url: "",
  description: "",
};

const createWebpageBookmarkService = useCreateWebpageBookmarkService();

const onSubmit = (formData: WebBookmarkLinkFormData): Promise<boolean> => {
  return createWebpageBookmarkService.createLink(formData);
};
</script>

<template>
  <WebpageBookmarkLinkForm
    form-icon="add"
    :form-title="t('elements.createLinkTitle')"
    :form-style-is-primary="false"
    :initial-form-data="initialCreateLinkFormData"
    :on-submit="onSubmit"
    :reset-form-on-submit-success="true"
    :submit-btn-label="t('elements.createButton')"
  />
</template>

<style scoped></style>
