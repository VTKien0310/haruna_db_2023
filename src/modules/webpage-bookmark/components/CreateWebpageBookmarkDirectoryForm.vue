<script setup lang="ts">
import { useCreateWebpageBookmarkService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";
import WebpageBookmarkDirectoryForm from "@/modules/webpage-bookmark/components/WebpageBookmarkDirectoryForm.vue";
import type { WebBookmarkDirectoryFormData } from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";

const initialCreateDirectoryFormData: WebBookmarkDirectoryFormData = {
  name: "",
  description: "",
};

const createWebpageBookmarkService = useCreateWebpageBookmarkService();

const onSubmit = (formData: WebBookmarkDirectoryFormData): Promise<boolean> => {
  return createWebpageBookmarkService.createDirectory(formData);
};
</script>

<template>
  <WebpageBookmarkDirectoryForm
    form-icon="create_new_folder"
    form-title="Create new directory"
    :form-style-is-primary="false"
    :initial-form-data="initialCreateDirectoryFormData"
    :on-submit="onSubmit"
    :reset-form-on-submit-success="true"
    submit-btn-label="Create"
  />
</template>

<style scoped></style>
