<script setup lang="ts" generic="T extends string | number">
import HButton from "./HButton.vue";
import type { HButtonOption, HColor } from "../types/UiTypes";
defineProps<{
  modelValue: T;
  options: (Omit<HButtonOption, "value"> & { value: T })[];
  preset?: "secondary" | "plain";
  borderColor?: HColor;
}>();
const emit = defineEmits<{ "update:modelValue": [value: T] }>();
</script>
<template>
  <div
    class="h-ui h-segmented border-control-border bg-background-secondary inline-flex max-w-full overflow-hidden rounded-(--h-control-radius) border"
    role="group"
    aria-label="View mode"
  >
    <HButton
      v-for="option in options"
      :key="option.value"
      :icon="option.icon"
      :disabled="option.disabled"
      :preset="modelValue === option.value ? '' : preset"
      :border-color="borderColor"
      :aria-pressed="modelValue === option.value"
      :aria-label="
        option.label ?? option.icon?.replace(/_/g, ' ') ?? String(option.value)
      "
      @click="emit('update:modelValue', option.value)"
      ><template v-if="option.label">{{ option.label }}</template></HButton
    >
  </div>
</template>
