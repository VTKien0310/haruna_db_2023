<script setup lang="ts">
// Adapted from VaButton's content/icon/loading structure and presets. See ../LICENSE.
import { computed, useAttrs, type VNode } from "vue";
import {
  colorVariable,
  foregroundColor,
  type HColor,
  type HSize,
} from "../types/UiTypes";
import HIcon from "./HIcon.vue";
import HProgressCircle from "./HProgressCircle.vue";
const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    color?: HColor;
    borderColor?: HColor | "";
    preset?: "" | "primary" | "secondary" | "plain";
    icon?: string;
    round?: boolean;
    size?: HSize;
  }>(),
  { type: "button", color: "primary", preset: "", size: "medium" },
);
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const slots = defineSlots<{
  default?: () => VNode[];
  prepend?: () => VNode[];
  append?: () => VNode[];
  loading?: () => VNode[];
}>();
const attrs = useAttrs();
const accessibleLabel = computed(() =>
  typeof attrs["aria-label"] === "string"
    ? attrs["aria-label"]
    : props.icon && !slots.default
      ? props.icon.replace(/_/g, " ")
      : undefined,
);
const secondary = computed(
  () => props.preset === "secondary" || props.preset === "plain",
);
const iconOnly = computed(() => Boolean(props.icon && !slots.default));
const tinted = computed(() => props.preset === "primary");
const quietColor = computed(() =>
  foregroundColor(props.color) === "primary" ? "primary" : props.color,
);
const foreground = computed(() =>
  secondary.value || tinted.value
    ? quietColor.value
    : foregroundColor(props.color),
);
const style = computed(() => ({
  "--h-button-color": colorVariable(props.color),
  color: colorVariable(foreground.value),
  backgroundColor: tinted.value
    ? `color-mix(in srgb, ${colorVariable(props.color)} 10%, transparent)`
    : secondary.value
      ? "transparent"
      : colorVariable(props.color),
  padding: iconOnly.value ? "0" : undefined,
  "--h-button-icon-size": `var(${props.size === "small" ? "--h-button-small-height" : props.size === "large" ? "--h-button-large-height" : "--h-control-height"})`,
  borderColor: props.borderColor
    ? colorVariable(props.borderColor)
    : props.preset === "secondary"
      ? colorVariable(quietColor.value)
      : "transparent",
}));
</script>
<template>
  <button
    :type="type"
    class="h-ui h-button h-focus relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 border font-medium disabled:cursor-default"
    :class="[
      size === 'small'
        ? 'min-h-(--h-button-small-height) px-3 py-1.5 text-sm leading-5'
        : size === 'large'
          ? 'min-h-(--h-button-large-height) px-4 py-3 text-sm leading-5'
          : 'min-h-(--h-control-height) px-4 py-2 text-sm leading-5',
      round ? 'rounded-full' : 'rounded-(--h-control-radius)',
      {
        'h-button-icon-only': iconOnly,
        'h-button-disabled': disabled,
      },
    ]"
    :style="style"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    :aria-label="accessibleLabel"
    @click="emit('click', $event)"
  >
    <span
      class="inline-flex items-center justify-center gap-1"
      :class="{ 'opacity-0': loading }"
      ><slot name="prepend"
        ><HIcon
          v-if="icon"
          :name="icon"
          :size="size === 'small' ? '1rem' : '1.25rem'" /></slot
      ><slot /><slot name="append"
    /></span>
    <span
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center"
      ><slot name="loading"
        ><HProgressCircle
          indeterminate
          size="small"
          :color="foreground" /></slot
    ></span>
  </button>
</template>
<style scoped>
/* Utility widths (such as w-full on profile actions) can override icon sizing. */
@layer components {
  .h-button-icon-only {
    width: var(--h-button-icon-size);
    height: var(--h-button-icon-size);
  }
}
.h-button-disabled {
  color: var(--color-secondary) !important;
  background: var(--color-background-element) !important;
  border-color: var(--color-background-border) !important;
}
.h-button:not(:disabled):hover::after,
.h-button:not(:disabled):active::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: currentColor;
  opacity: 0.13;
  pointer-events: none;
}
.h-button:not(:disabled):active::after {
  opacity: 0.2;
}
</style>
