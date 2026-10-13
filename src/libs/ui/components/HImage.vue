<script setup lang="ts">
import { ref, watch } from "vue";
const props = withDefaults(
  defineProps<{
    src: string;
    alt?: string;
    fit?: "cover" | "contain";
    ratio?: number;
  }>(),
  { alt: "", fit: "cover" },
);
const emit = defineEmits<{ load: [event: Event]; error: [event: Event] }>();
const loaded = ref(false);
const failed = ref(false);
watch(
  () => props.src,
  () => {
    loaded.value = false;
    failed.value = false;
  },
);
</script>
<template>
  <div
    class="h-image relative overflow-hidden"
    :style="{ aspectRatio: ratio }"
    :aria-busy="!loaded && !failed"
  >
    <img
      v-if="src && !failed"
      :key="src"
      :src="src"
      :alt="alt"
      class="h-full w-full"
      :class="{ invisible: !loaded }"
      :style="{ objectFit: fit }"
      @load="
        loaded = true;
        emit('load', $event);
      "
      @error="
        failed = true;
        emit('error', $event);
      "
    />
    <div v-if="!loaded && !failed" class="absolute inset-0">
      <slot name="loader"
        ><div class="h-pulse bg-background-element h-full w-full"
      /></slot>
    </div>
    <div
      v-if="failed || !src"
      class="bg-background-element text-secondary flex h-full min-h-12 items-center justify-center"
    >
      <slot name="error"
        ><span role="img" :aria-label="alt || 'Image unavailable'"
          >Image unavailable</span
        ></slot
      >
    </div>
    <slot v-if="loaded" />
  </div>
</template>
