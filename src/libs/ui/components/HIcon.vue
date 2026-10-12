<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { colorVariable, type HColor } from "../types/UiTypes";
const props = withDefaults(
  defineProps<{ name: string; color?: HColor; size?: string | number }>(),
  { size: "1.5rem" },
);
const attrs = useAttrs();
const sizeValue = computed(() =>
  typeof props.size === "number" ? `${props.size}px` : props.size,
);
</script>
<template>
  <span
    class="h-icon material-icons inline-flex shrink-0 items-center justify-center align-middle"
    :aria-hidden="attrs['aria-label'] ? undefined : true"
    :role="attrs['aria-label'] ? 'img' : undefined"
    :style="{
      color: color ? colorVariable(color) : undefined,
      fontSize: sizeValue,
      width: sizeValue,
      height: sizeValue,
      lineHeight: 1,
    }"
    >{{ name }}</span
  >
</template>
