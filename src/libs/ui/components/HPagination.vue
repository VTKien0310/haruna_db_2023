<script setup lang="ts">
import { computed } from "vue";
import HButton from "./HButton.vue";
const props = withDefaults(
  defineProps<{ modelValue: number; pages: number; disabled?: boolean }>(),
  { disabled: false },
);
const total = computed(() => Math.max(0, Math.floor(props.pages)));
const emit = defineEmits<{ "update:modelValue": [value: number] }>();
function select(value: number) {
  if (
    !props.disabled &&
    value >= 1 &&
    value <= total.value &&
    value !== props.modelValue
  )
    emit("update:modelValue", value);
}
</script>
<template>
  <nav
    v-if="total > 0"
    class="h-ui inline-flex max-w-full flex-wrap items-center gap-1"
    aria-label="Pagination"
    @keydown.left.prevent="select(modelValue - 1)"
    @keydown.right.prevent="select(modelValue + 1)"
    @keydown.up.prevent="select(modelValue - 1)"
    @keydown.down.prevent="select(modelValue + 1)"
  >
    <HButton
      v-for="page in total"
      :key="page"
      :aria-label="`Page ${page}`"
      :aria-current="page === modelValue ? 'page' : undefined"
      :preset="page === modelValue ? '' : 'secondary'"
      class="min-w-(--h-control-height)"
      :disabled="disabled"
      @click="select(page)"
      >{{ page }}</HButton
    >
  </nav>
</template>
