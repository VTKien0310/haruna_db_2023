<script setup lang="ts">
import { VaButton } from "vuestic-ui";

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  "toggle-sidebar": [];
}>();
</script>

<template>
  <div
    v-if="visible"
    class="border-background-border bg-background-secondary fixed top-0 left-0 z-40 flex h-12 w-full items-center justify-between border-b px-4 shadow-md"
  >
    <h1 class="branding-font text-primary text-xl font-bold">HARUNA</h1>
    <va-button @click="emit('toggle-sidebar')" icon="menu" preset="plain" />
  </div>
</template>
