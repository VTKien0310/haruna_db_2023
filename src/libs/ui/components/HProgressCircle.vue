<script setup lang="ts">
// Geometry and sizing adapted from VaProgressCircle; see ../LICENSE.
import { computed } from "vue";
import { colorVariable, type HColor, type HSize } from "../types/UiTypes";
const props = withDefaults(
  defineProps<{
    modelValue?: number;
    indeterminate?: boolean;
    size?: HSize;
    color?: HColor;
  }>(),
  { modelValue: 0, size: "medium", color: "primary" },
);
const progress = computed(() => Math.min(100, Math.max(0, props.modelValue)));
const radius = 20;
const circumference = 2 * Math.PI * radius;
</script>
<template>
  <svg
    class="h-progress-circle inline-block shrink-0"
    :class="[
      { 'h-spinner': indeterminate },
      size === 'small'
        ? 'h-4 w-4'
        : size === 'large'
          ? 'h-12 w-12'
          : 'h-10 w-10',
    ]"
    viewBox="0 0 48 48"
    role="progressbar"
    aria-label="Progress"
    :aria-valuenow="indeterminate ? undefined : progress"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :style="{ color: colorVariable(color) }"
  >
    <circle
      v-if="!indeterminate"
      cx="24"
      cy="24"
      :r="radius"
      fill="none"
      stroke="currentColor"
      :stroke-width="size === 'small' ? 4 : 2"
      opacity="0.15"
    />
    <circle
      cx="24"
      cy="24"
      :r="radius"
      fill="none"
      stroke="currentColor"
      :stroke-width="size === 'small' ? 4 : 2"
      stroke-linecap="round"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="
        circumference * (1 - (indeterminate ? 0.7 : progress / 100))
      "
      transform="rotate(-90 24 24)"
    />
  </svg>
</template>
