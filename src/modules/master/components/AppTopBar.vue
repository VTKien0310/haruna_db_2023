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
    class="branding-background border-background-border fixed top-0 right-0 left-0 z-40 flex h-14 w-full items-center justify-between border-b px-4 text-white shadow-md"
  >
    <h1 class="branding-font font-bold">HARUNA</h1>
    <va-button @click="emit('toggle-sidebar')" icon="menu" size="large" />
  </div>
</template>

<style scoped>
.branding-font {
  margin: 0;
}
</style>
