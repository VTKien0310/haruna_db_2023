<script setup lang="ts">
import { computed, type VNode } from "vue";
const props = withDefaults(
  defineProps<{
    modelValue?: number;
    max?: number;
    indeterminate?: boolean;
    showPercent?: boolean;
  }>(),
  { modelValue: 0, max: 100 },
);
const slots = defineSlots<{
  default?: (props: { value: number }) => VNode[];
}>();
const maximum = computed(() =>
  Number.isFinite(props.max) ? Math.max(0, props.max) : 0,
);
const value = computed(() =>
  Number.isFinite(props.modelValue)
    ? Math.max(0, Math.min(maximum.value, props.modelValue))
    : 0,
);
const percentage = computed(() =>
  maximum.value ? (value.value * 100) / maximum.value : 0,
);
</script>

<template>
  <div
    class="h-ui w-full"
    role="progressbar"
    aria-label="Progress"
    aria-valuemin="0"
    :aria-valuemax="maximum"
    :aria-valuenow="indeterminate ? undefined : value"
  >
    <div class="bg-background-element h-2 overflow-hidden rounded-full">
      <div
        class="bg-brand-cyan h-full rounded-full"
        :class="{ 'h-progress-indeterminate': indeterminate }"
        :style="{ width: indeterminate ? '30%' : `${percentage}%` }"
      />
    </div>
    <div
      v-if="slots.default || (showPercent && !indeterminate)"
      class="text-text-primary mt-1 text-right text-sm"
    >
      <slot :value="modelValue">{{ Math.round(percentage) }}%</slot>
    </div>
  </div>
</template>
