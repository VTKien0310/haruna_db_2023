<script setup lang="ts">
import { computed, provide, type VNode } from "vue";
import { FormService } from "../services/FormService";
import { FORM_KEY } from "../types/UiTypes";

const form = new FormService();
provide(FORM_KEY, form);
const isValid = computed(() => form.isValid);
const validate = () => form.validate();
const reset = () => form.reset();
const resetValidation = () => form.resetValidation();
const focus = () => form.focus();
defineExpose({ isValid, validate, reset, resetValidation, focus });
defineSlots<{
  default?: (props: {
    isValid: boolean;
    validate: () => boolean;
    reset: () => void;
    resetValidation: () => void;
  }) => VNode[];
}>();
</script>

<template>
  <form class="h-ui h-form" novalidate>
    <slot
      :is-valid="isValid"
      :validate="validate"
      :reset="reset"
      :reset-validation="resetValidation"
    />
  </form>
</template>
