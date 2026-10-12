<script setup lang="ts">
defineProps<{ modelValue?: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
</script>
<template>
  <div
    @mouseenter="emit('update:modelValue', true)"
    @mouseleave="emit('update:modelValue', false)"
    @focusin="emit('update:modelValue', true)"
    @focusout="emit('update:modelValue', false)"
  >
    <slot :hover="modelValue" />
  </div>
</template>
