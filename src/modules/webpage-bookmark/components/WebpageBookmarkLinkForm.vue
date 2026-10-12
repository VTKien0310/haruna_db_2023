<script setup lang="ts">
import {
  type HFormHandle,
  HButton,
  HForm,
  HInput,
  HModal,
  HTextarea,
} from "@/libs/ui";
import { computed, reactive, ref } from "vue";
import type { WebBookmarkLinkFormData } from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";

interface Props {
  formIcon?: string;
  formTitle?: string;
  formStyleIsPrimary?: boolean;
  initialFormData: WebBookmarkLinkFormData;
  onSubmit: (formData: WebBookmarkLinkFormData) => Promise<boolean>;
  resetFormOnSubmitSuccess: boolean;
  submitBtnLabel?: string;
}

const {
  formIcon = "edit",
  formTitle = "Webpage bookmark link",
  formStyleIsPrimary = true,
  initialFormData,
  onSubmit,
  resetFormOnSubmitSuccess,
  submitBtnLabel = "Submit",
} = defineProps<Props>();

const formRef = ref<HFormHandle>();
const validCreationData = computed(() => formRef.value?.isValid ?? false);
const validate = () => formRef.value?.validate() ?? false;
const resetValidation = () => formRef.value?.resetValidation();

const showForm = ref<boolean>(false);

const triggerShowForm = (): void => {
  showForm.value = !showForm.value;
  resetValidation();
};

const formData = reactive<WebBookmarkLinkFormData>({
  name: initialFormData.name,
  url: initialFormData.url,
  description: initialFormData.description,
});

const resetFormData = (): void => {
  formData.name = initialFormData.name;
  formData.url = initialFormData.url;
  formData.description = initialFormData.description;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const submitForm = async (): Promise<void> => {
  if (!validCreationData.value) {
    return;
  }

  triggerShowForm();

  const submitResult = await onSubmit(formData);

  if (submitResult && resetFormOnSubmitSuccess) {
    resetFormData();
  }
};
</script>

<template>
  <h-button
    @click="triggerShowForm"
    :icon="formIcon"
    round
    class="m-1"
    :preset="formStyleIsPrimary ? '' : 'secondary'"
    :border-color="formStyleIsPrimary ? '' : 'primary'"
  />

  <h-modal
    v-model="showForm"
    :title="formTitle"
    hide-default-actions
    no-dismiss
  >
    <!--    form content-->
    <h-form
      ref="formRef"
      class="flex w-full flex-col content-center justify-center"
    >
      <h-input
        v-model="formData.name"
        :rules="[
          (value) => (value && value.length > 0) || 'Link name is required',
          (value) =>
            (value && value.length <= 30) || 'Link name max length is 30',
        ]"
        label="Name"
        class="mb-2 w-full"
      />
      <h-input
        v-model="formData.url"
        type="url"
        :rules="[(value) => isValidUrl(value) || 'Must be a valid URL']"
        label="URL"
        class="mb-2 w-full"
      />
      <h-textarea
        v-model="formData.description"
        label="Description"
        :min-rows="5"
        :max-rows="5"
        :resize="false"
        class="mb-2 w-full"
      />

      <!--      form action-->
      <div class="flex w-full flex-row content-center justify-end">
        <h-button
          @click="triggerShowForm"
          preset="secondary"
          color="secondary"
          class="mr-2"
        >
          Cancel
        </h-button>
        <h-button
          @click="validate() && submitForm()"
          :disabled="!validCreationData"
          type="submit"
        >
          {{ submitBtnLabel }}
        </h-button>
      </div>
    </h-form>
  </h-modal>
</template>

<style scoped></style>
