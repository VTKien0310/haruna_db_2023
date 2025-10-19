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
import type { WebBookmarkDirectoryFormData } from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";

interface Props {
  formIcon?: string;
  formTitle?: string;
  formStyleIsPrimary?: boolean;
  initialFormData: WebBookmarkDirectoryFormData;
  onSubmit: (formData: WebBookmarkDirectoryFormData) => Promise<boolean>;
  resetFormOnSubmitSuccess: boolean;
  submitBtnLabel?: string;
}

const {
  formIcon = "edit",
  formTitle = "Webpage bookmark directory",
  formStyleIsPrimary = true,
  initialFormData,
  onSubmit,
  resetFormOnSubmitSuccess,
  submitBtnLabel = "Submit",
} = defineProps<Props>();

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

const formData = reactive<WebBookmarkDirectoryFormData>({
  name: initialFormData.name,
  description: initialFormData.description,
});

const resetFormData = (): void => {
  formData.name = initialFormData.name;
  formData.description = initialFormData.description;
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
  <va-button
    @click="triggerShowForm"
    :icon="formIcon"
    round
    class="m-1"
    :preset="formStyleIsPrimary ? '' : 'secondary'"
    :border-color="formStyleIsPrimary ? '' : 'primary'"
  />

  <va-modal
    v-model="showForm"
    :title="formTitle"
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
          (value) =>
            (value && value.length <= 30) || 'Directory name max length is 30',
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
          {{ submitBtnLabel }}
        </va-button>
      </div>
    </va-form>
  </va-modal>
</template>

<style scoped></style>
