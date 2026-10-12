<script setup lang="ts">
import { HButton } from "@/libs/ui";
import logo from "@/assets/logo.svg";

withDefaults(
  defineProps<{
    visible: boolean;
    sidebarOpen?: boolean;
    sidebarId?: string;
  }>(),
  { sidebarOpen: false, sidebarId: "app-navigation" },
);

const emit = defineEmits<{
  "navigate-home": [];
  "toggle-sidebar": [];
}>();
</script>

<template>
  <header
    v-if="visible"
    class="h-ui bg-background-secondary border-background-border text-primary fixed top-0 right-0 left-0 z-(--h-header-z-index) flex h-(--h-app-header-height) w-full items-center justify-between border-b px-4"
  >
    <h-button
      preset="plain"
      class="p-0"
      aria-label="Go to home"
      @click="emit('navigate-home')"
    >
      <span class="flex items-center gap-3">
        <img :src="logo" alt="" class="h-10 w-10 shrink-0" />
        <span class="text-(length:--h-wordmark-size) font-semibold"
          >Haruna</span
        >
      </span>
    </h-button>
    <h-button
      @click="emit('toggle-sidebar')"
      icon="menu"
      preset="secondary"
      border-color="backgroundBorder"
      aria-label="Open navigation"
      :aria-expanded="sidebarOpen"
      :aria-controls="sidebarId"
    />
  </header>
</template>
