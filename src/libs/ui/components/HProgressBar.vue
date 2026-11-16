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
    <div
      class="h-progress-track bg-secondary-container relative h-1 overflow-hidden rounded-full"
    >
      <div
        class="h-progress-indicator bg-primary h-full rounded-full"
        :class="{ 'h-progress-indeterminate': indeterminate }"
        :style="{
          width: indeterminate ? '30%' : `max(0px, calc(${percentage}% - 8px))`,
        }"
      />
      <span
        v-if="!indeterminate && percentage > 0"
        aria-hidden="true"
        class="h-progress-stop bg-primary absolute top-1/2 h-1 w-1 -translate-x-full -translate-y-1/2 rounded-full"
        :style="{ left: `${percentage}%` }"
      />
    </div>
    <div
      v-if="slots.default || (showPercent && !indeterminate)"
      class="text-on-surface text-body-small mt-1 text-right"
    >
      <slot :value="modelValue">{{ Math.round(percentage) }}%</slot>
    </div>
  </div>
</template>
