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
import type { WebBookmarkLinkFormData } from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";
import type { WebpageBookmark } from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import { isValidUrl } from "@/modules/master/MasterUtil.ts";

const props = defineProps<{
  webpageBookmark: WebpageBookmark;
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

const formData = reactive<WebBookmarkLinkFormData>({
  name: props.webpageBookmark.name,
  url: props.webpageBookmark.url,
  description: props.webpageBookmark.description,
});

const resetFormData = (): void => {
  formData.name = props.webpageBookmark.name;
  formData.url = props.webpageBookmark.url;
  formData.description = props.webpageBookmark.description;
};

const submitForm = async (): Promise<void> => {
  if (!validCreationData.value) {
    return;
  }

  triggerShowForm();

  resetFormData();
};
</script>

<template>
  <va-button @click="triggerShowForm" icon="edit" round class="m-1" />

  <va-modal
    v-model="showForm"
    title="Update link"
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
          Update
        </va-button>
      </div>
    </va-form>
  </va-modal>
</template>

<style scoped></style>
