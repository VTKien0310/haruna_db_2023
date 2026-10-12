<script setup lang="ts">
import { colorVariable, type HColor } from "../types/UiTypes";
withDefaults(defineProps<{ color?: HColor }>(), {
  color: "backgroundSecondary",
});
</script>
<template>
  <div
    class="h-ui text-text-primary border-background-border rounded-(--h-panel-radius) border"
    :style="{ backgroundColor: colorVariable(color) }"
  >
    <slot />
  </div>
</template>
