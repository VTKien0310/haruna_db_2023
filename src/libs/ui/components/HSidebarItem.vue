<script setup lang="ts">
defineProps<{ active?: boolean }>();
</script>
<template>
  <button
    type="button"
    class="h-focus h-state-layer text-label-large relative isolate min-h-14 w-full cursor-pointer rounded-full text-left"
    :class="
      active
        ? 'text-on-secondary-container font-medium'
        : 'text-on-surface-variant'
    "
    :aria-current="active ? 'page' : undefined"
  >
    <span
      v-if="active"
      aria-hidden="true"
      class="bg-secondary-container absolute inset-0 -z-10 rounded-full"
    />
    <slot />
  </button>
</template>
