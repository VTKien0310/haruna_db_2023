<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string;
    height?: string;
  }>(),
  { width: "100%", height: "1rem" },
);
</script>
<template>
  <div
    aria-hidden="true"
    class="h-ui h-pulse bg-background-element rounded-(--h-control-radius)"
    :style="{ width, height }"
  />
</template>
