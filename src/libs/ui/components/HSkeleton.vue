<script setup lang="ts">
withDefaults(
  defineProps<{
    animation?: "pulse" | "none";
    variant?: "squared" | "rounded";
    width?: string;
    height?: string;
  }>(),
  { animation: "pulse", variant: "squared", width: "100%", height: "1rem" },
);
</script>
<template>
  <div
    aria-hidden="true"
    class="bg-background-element"
    :class="{
      'h-pulse': animation === 'pulse',
      'rounded-(--h-control-radius)': variant === 'rounded',
    }"
    :style="{ width, height }"
  />
</template>
