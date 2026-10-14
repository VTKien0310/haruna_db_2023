<script setup lang="ts">
import { HSelect } from "@/libs/ui";
import { THEME_OPTIONS } from "../ThemeEntities";
import { useThemeStore } from "../stores/ThemeStore";
import { useThemeService } from "../MasterServiceContainer";

const store = useThemeStore();
const service = useThemeService();
</script>

<template>
  <section aria-label="Appearance" class="mt-6 flex flex-col gap-2">
    <h2 class="text-base font-medium">Appearance</h2>
    <HSelect
      :model-value="store.themeId"
      :options="[...THEME_OPTIONS]"
      value-by="id"
      text-by="label"
      label="Theme"
      aria-describedby="theme-device-description"
      @update:model-value="service.select($event)"
    />
    <p id="theme-device-description" class="text-secondary text-sm">
      Saved on this device.
    </p>
  </section>
</template>
