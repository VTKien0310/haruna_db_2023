<script setup lang="ts">
import {
  useForm,
  VaButton,
  VaForm,
  VaInput,
  VaModal,
  VaTextarea,
} from "vuestic-ui";
import { reactive, ref } from "vue";
import { useCreateWebpageBookmarkService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";
import type { CreateWebBookmarkDirectoryData } from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";

const webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();

const {
  isValid: validCreationData,
  validate,
  resetValidation,
} = useForm("formRef");

const showForm = ref<boolean>(false);

const triggerShowForm = (): void => {
  showForm.value = !showForm.value;
  resetValidation();
};

const formData = reactive<CreateWebBookmarkDirectoryData>({
  name: "",
  description: "",
});

const resetFormData = (): void => {
  formData.name = "";
  formData.description = "";
};

const createWebpageBookmarkService = useCreateWebpageBookmarkService();

const submitForm = (): void => {
  if (!validCreationData.value) {
    return;
  }

  const directoryParent = webpageBookmarkDetailStore.currentRecordIsRoot
    ? undefined
    : webpageBookmarkDetailStore.webpageBookmark!;

  createWebpageBookmarkService
    .createDirectory(formData, directoryParent)
    .then((success: boolean) => {
      if (success) {
        resetFormData();
      }
    });

  triggerShowForm();
};
</script>

<template>
  <va-button
    @click="triggerShowForm"
    icon="create_new_folder"
    round
    class="m-1"
    preset="secondary"
    border-color="primary"
  />

  <va-modal
    v-model="showForm"
    title="Create new directory"
    hide-default-actions
    no-dismiss
  >
    <!--    form content-->
    <va-form
      ref="formRef"
      class="flex w-full flex-col content-center justify-center"
    >
      <va-input
        v-model="formData.name"
        :rules="[
          (value) =>
            (value && value.length > 0) || 'Directory name is required',
        ]"
        label="Name"
        class="mb-2 w-full"
      />
      <va-textarea
        v-model="formData.description"
        label="Description"
        :min-rows="5"
        :max-rows="5"
        :resize="false"
        class="mb-2 w-full"
      />

      <!--      form action-->
      <div class="flex w-full flex-row content-center justify-end">
        <va-button
          @click="triggerShowForm"
          preset="secondary"
          color="secondary"
          class="mr-2"
        >
          Cancel
        </va-button>
        <va-button
          @click="validate() && submitForm()"
          :disabled="!validCreationData"
          type="submit"
        >
          Submit
        </va-button>
      </div>
    </va-form>
  </va-modal>
</template>

<style scoped></style>
