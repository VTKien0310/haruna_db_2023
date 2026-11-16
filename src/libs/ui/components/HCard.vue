<script setup lang="ts">
import type { HCardVariant } from "../types/UiTypes";

const props = withDefaults(defineProps<{ variant?: HCardVariant }>(), {
  variant: "outlined",
});
const VARIANTS: Record<HCardVariant, string> = {
  elevated: "bg-surface-container-low shadow-level-1",
  filled: "bg-surface-container-highest",
  outlined: "bg-surface border-outline-variant border",
};
</script>
<template>
  <div
    class="h-ui text-on-surface rounded-medium"
    :class="VARIANTS[props.variant] ?? VARIANTS.outlined"
  >
    <slot />
  </div>
</template>
