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

const props = defineProps<{
  parentWebpageBookmark: WebpageBookmark;
}>();

const { isValid, validate, reset, resetValidation } = useForm("formRef");

const showForm = ref(false);

const triggerShowForm = () => {
  showForm.value = !showForm.value;
  resetValidation();
};

interface CreateDirectoryFormData {
  name: string;
  description: string;
}

const formData = reactive<CreateDirectoryFormData>({
  name: "",
  description: "",
});

const createWebpageBookmarkService = useCreateWebpageBookmarkService();

const submitForm = () => {
  const parentDirectory =
    props.parentWebpageBookmark.id !== WEB_BOOKMARK_ROOT_DIR_ID
      ? props.parentWebpageBookmark
      : undefined;

  createWebpageBookmarkService.createDirectory(
    formData.name,
    formData.description,
    parentDirectory,
  );

  reset();
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
          :disabled="!isValid"
          type="submit"
        >
          Submit
        </va-button>
      </div>
    </va-form>
  </va-modal>
</template>

<style scoped></style>
