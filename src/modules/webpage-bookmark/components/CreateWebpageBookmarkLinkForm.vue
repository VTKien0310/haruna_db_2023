<script setup lang="ts">
import { useCreateWebpageBookmarkService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";
import WebpageBookmarkLinkForm from "@/modules/webpage-bookmark/components/WebpageBookmarkLinkForm.vue";
import type { WebBookmarkLinkFormData } from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";

const initialCreateLinkFormData = {
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
    form-title="Create new link"
    :form-style-is-primary="false"
    :initial-form-data="initialCreateLinkFormData"
    :on-submit="onSubmit"
    :reset-form-on-submit-success="true"
    submit-btn-label="Create"
  />
</template>

<style scoped></style>
