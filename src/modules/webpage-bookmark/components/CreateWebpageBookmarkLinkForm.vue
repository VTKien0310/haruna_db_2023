<script setup lang="ts">
import {
  WEB_BOOKMARK_ROOT_DIR_ID,
  type WebpageBookmark,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
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
import type { CreateWebBookmarkLinkData } from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";

const props = defineProps<{
  parentWebpageBookmark: WebpageBookmark;
}>();

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

const formData = reactive<CreateWebBookmarkLinkData>({
  name: "",
  url: "",
  description: "",
});

const resetFormData = (): void => {
  formData.name = "";
  formData.url = "";
  formData.description = "";
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const createWebpageBookmarkService = useCreateWebpageBookmarkService();

const parentIsRootDirectory =
  props.parentWebpageBookmark.id === WEB_BOOKMARK_ROOT_DIR_ID;

const submitForm = (): void => {
  if (!validCreationData.value) {
    return;
  }

  const directoryParent = parentIsRootDirectory
    ? undefined
    : props.parentWebpageBookmark;

  createWebpageBookmarkService
    .createLink(formData, directoryParent)
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
    icon="add"
    round
    class="m-1"
    preset="secondary"
    border-color="primary"
  />

  <va-modal
    v-model="showForm"
    title="Add new link"
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
          (value) => (value && value.length > 0) || 'Link name is required',
        ]"
        label="Name"
        class="mb-2 w-full"
      />
      <va-input
        v-model="formData.url"
        type="url"
        :rules="[(value) => isValidUrl(value) || 'Must be a valid URL']"
        label="URL"
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
