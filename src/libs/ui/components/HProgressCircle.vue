<script setup lang="ts">
import { computed } from "vue";
import type { HSize } from "../types/UiTypes";

const props = withDefaults(
  defineProps<{
    modelValue?: number;
    indeterminate?: boolean;
    size?: HSize;
  }>(),
  { modelValue: 0, size: "medium" },
);
const SIZES: Record<HSize, string> = {
  small: "h-4 w-4",
  medium: "h-10 w-10",
  large: "h-12 w-12",
};
const progress = computed(() =>
  Number.isFinite(props.modelValue)
    ? Math.max(0, Math.min(100, props.modelValue))
    : 0,
);
</script>

<template>
  <svg
    class="h-ui h-progress-circle inline-block shrink-0"
    :class="[SIZES[size] ?? SIZES.medium, { 'h-spinner': indeterminate }]"
    viewBox="0 0 32 32"
    role="progressbar"
    aria-label="Progress"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="indeterminate ? undefined : progress"
  >
    <circle class="h-progress-track" cx="16" cy="16" r="13" />
    <circle
      class="h-progress-value"
      cx="16"
      cy="16"
      r="13"
      pathLength="100"
      :stroke-dasharray="`${indeterminate ? 70 : progress} 100`"
    />
  </svg>
</template>

<style scoped>
.h-progress-circle {
  color: var(--color-primary);
}
:global(.h-button .h-progress-circle) {
  color: inherit;
}
circle {
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
}
.h-progress-track {
  opacity: 0.15;
}
.h-progress-value {
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
}
</style>
