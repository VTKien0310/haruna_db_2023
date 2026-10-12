<script setup lang="ts">
import { computed, provide, shallowRef, type VNode } from "vue";
import { FormService, type FieldService } from "../services/FormService";
import { FORM_KEY } from "../types/UiTypes";
defineSlots<{
  default?: (props: {
    isValid: boolean;
    validate: () => boolean;
    reset: () => void;
    resetValidation: () => void;
  }) => VNode[];
}>();

withDefaults(defineProps<{ tag?: "form" | "div" }>(), { tag: "form" });
const service = new FormService(shallowRef<readonly FieldService[]>([]));
provide(FORM_KEY, service);
const isValid = computed(() => service.isValid);
const validate = () => service.validate();
const reset = () => service.reset();
const resetValidation = () => service.resetValidation();
const focus = () => service.focus();
defineExpose({ isValid, validate, reset, resetValidation, focus });
</script>

<template>
  <component :is="tag" class="h-ui h-form" novalidate>
    <slot
      :is-valid="isValid"
      :validate="validate"
      :reset="reset"
      :reset-validation="resetValidation"
    />
  </component>
</template>
