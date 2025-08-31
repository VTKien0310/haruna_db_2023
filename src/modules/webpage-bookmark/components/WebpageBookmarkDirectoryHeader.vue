<script setup lang="ts">
import { VaButton } from "vuestic-ui";

defineProps<{
  name: string;
}>();
</script>

<template>
  <div class="m-1 flex flex-row content-center items-center justify-between">
    <p>{{ name }}</p>
    <div class="flex flex-row content-center items-center justify-end">
      <va-button
        icon="create_new_folder"
        preset="secondary"
        border-color="primary"
        class="mr-1"
      />
      <va-button
        icon="playlist_add"
        preset="secondary"
        border-color="primary"
      />
    </div>
  </div>
</template>

<style scoped></style>
