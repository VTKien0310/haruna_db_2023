<script setup lang="ts">
import { computed, type VNode } from "vue";
import { colorVariable, type HColor, type HSize } from "../types/UiTypes";
defineSlots<{ default?: (props: { value: number }) => VNode[] }>();
const props = withDefaults(
  defineProps<{
    modelValue?: number;
    max?: number;
    indeterminate?: boolean;
    size?: HSize;
    contentInside?: boolean;
    showPercent?: boolean;
    color?: HColor;
  }>(),
  { modelValue: 0, max: 100, size: "medium", color: "brandCyan" },
);
const percentage = computed(() =>
  props.max > 0
    ? Math.min(100, Math.max(0, (props.modelValue / props.max) * 100))
    : 0,
);
</script>
<template>
  <div
    class="h-ui w-full"
    role="progressbar"
    aria-label="Progress"
    :aria-valuenow="
      indeterminate
        ? undefined
        : Math.min(Math.max(0, modelValue), Math.max(0, max))
    "
    :aria-valuemin="0"
    :aria-valuemax="max"
  >
    <div
      class="bg-background-element relative w-full overflow-hidden rounded-full"
      :class="
        size === 'large' || contentInside
          ? 'h-6'
          : size === 'small'
            ? 'h-1'
            : 'h-2'
      "
    >
      <div
        class="h-full rounded-full"
        :class="{ 'h-progress-indeterminate': indeterminate }"
        :style="{
          width: indeterminate ? '30%' : `${percentage}%`,
          backgroundColor: colorVariable(color),
        }"
      />
      <div
        v-if="contentInside"
        class="absolute inset-0 flex items-center justify-center text-xs font-medium"
      >
        <span class="bg-background-secondary text-primary rounded px-1"
          ><slot :value="modelValue">{{
            showPercent ? `${Math.round(percentage)}%` : ""
          }}</slot></span
        >
      </div>
    </div>
    <div v-if="!contentInside && showPercent" class="text-right text-sm">
      {{ Math.round(percentage) }}%
    </div>
  </div>
</template>
