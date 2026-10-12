<script setup lang="ts">
defineProps<{ active?: boolean }>();
</script>
<template>
  <button
    type="button"
    class="h-focus relative w-full cursor-pointer rounded-(--h-control-radius) text-left"
    :class="
      active
        ? 'bg-selection text-primary font-medium'
        : 'text-text-primary hover:bg-background-element'
    "
    :aria-current="active ? 'page' : undefined"
  >
    <span
      v-if="active"
      aria-hidden="true"
      class="bg-brand-amber absolute inset-y-2 left-0 w-1 rounded-full"
    />
    <slot />
  </button>
</template>
