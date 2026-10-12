<script setup lang="ts">
import { colorVariable, type HColor } from "../types/UiTypes";
withDefaults(defineProps<{ color?: HColor }>(), {
  color: "backgroundSecondary",
});
</script>
<template>
  <nav
    class="h-ui text-text-primary w-full max-w-full overflow-y-auto"
    aria-label="Main navigation"
    :style="{ backgroundColor: colorVariable(color) }"
  >
    <slot />
  </nav>
</template>
