<script setup lang="ts" generic="T extends string | number">
import HButton from "./HButton.vue";
import HIcon from "./HIcon.vue";
import type { HButtonOption } from "../types/UiTypes";
defineProps<{
  modelValue: T;
  options: (Omit<HButtonOption, "value"> & { value: T })[];
}>();
const emit = defineEmits<{ "update:modelValue": [value: T] }>();
</script>
<template>
  <div
    class="h-ui h-button-toggle-group inline-flex max-w-full items-center gap-0.5"
    role="group"
    aria-label="View mode"
  >
    <HButton
      v-for="option in options"
      :key="option.value"
      :icon="option.icon"
      :disabled="option.disabled"
      color="secondary"
      shape="square"
      :variant="modelValue === option.value ? 'filled' : 'outlined'"
      :aria-pressed="modelValue === option.value"
      :aria-label="
        option.label ?? option.icon?.replace(/_/g, ' ') ?? String(option.value)
      "
      @click="emit('update:modelValue', option.value)"
      ><template v-if="option.icon" #prepend
        ><HIcon
          :name="option.icon"
          :filled="modelValue === option.value"
        /> </template
      ><template v-if="option.label" #default>{{
        option.label
      }}</template></HButton
    >
  </div>
</template>

<style scoped>
.h-button-toggle-group :deep(.h-button) {
  border-radius: var(--radius-extra-small);
}
.h-button-toggle-group :deep(.h-button[aria-pressed="true"]) {
  border-radius: var(--radius-medium);
}
.h-button-toggle-group :deep(.h-button:first-child) {
  border-start-start-radius: 9999px;
  border-end-start-radius: 9999px;
}
.h-button-toggle-group :deep(.h-button:last-child) {
  border-start-end-radius: 9999px;
  border-end-end-radius: 9999px;
}
.h-button-toggle-group :deep(.h-button:active) {
  border-radius: var(--radius-extra-small);
}
.h-button-toggle-group :deep(.h-button:active:first-child) {
  border-start-start-radius: 9999px;
  border-end-start-radius: 9999px;
}
.h-button-toggle-group :deep(.h-button:active:last-child) {
  border-start-end-radius: 9999px;
  border-end-end-radius: 9999px;
}
</style>
