<script setup lang="ts">
import { ref } from "vue";
import HTextField from "./HTextField.vue";
import type { HFieldHandle, HTextareaProps } from "../types/UiTypes";
const props = withDefaults(defineProps<HTextareaProps>(), { resize: true });
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const field = ref<HFieldHandle>();
defineExpose({
  focus: () => field.value?.focus(),
  blur: () => field.value?.blur(),
  reset: () => field.value?.reset(),
  validate: () => field.value?.validate() ?? true,
  resetValidation: () => field.value?.resetValidation(),
});
</script>
<template>
  <HTextField
    ref="field"
    v-bind="props"
    multiline
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
