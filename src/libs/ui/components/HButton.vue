<script setup lang="ts">
import { computed, useAttrs, type VNode } from "vue";
import {
  actionColor,
  colorVariable,
  type HActionColor,
  type HButtonVariant,
  type HSize,
} from "../types/UiTypes";
import HIcon from "./HIcon.vue";
import HProgressCircle from "./HProgressCircle.vue";

const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset";
    variant?: HButtonVariant;
    color?: HActionColor;
    size?: HSize;
    icon?: string;
    disabled?: boolean;
    loading?: boolean;
  }>(),
  { type: "button", variant: "solid", color: "primary", size: "medium" },
);
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const slots = defineSlots<{
  default?: () => VNode[];
  prepend?: () => VNode[];
  append?: () => VNode[];
  loading?: () => VNode[];
}>();
const attrs = useAttrs();
const SIZES: Record<HSize, string> = {
  small: "h-button-small min-h-(--h-button-small-height) px-3 py-1.5",
  medium: "h-button-medium min-h-(--h-control-height) px-4 py-2",
  large: "h-button-large min-h-(--h-button-large-height) px-4 py-3",
};
const VARIANTS: Record<HButtonVariant, string> = {
  solid: "h-button-solid",
  outlined: "h-button-outlined",
  quiet: "h-button-quiet",
};
const tone = computed(() => actionColor(props.color));
const palette = computed(() => ({
  "--h-action-fill": colorVariable(tone.value),
  "--h-action-text": colorVariable(
    tone.value === "warning" ? "primary" : tone.value,
  ),
  "--h-action-foreground": colorVariable(
    tone.value === "warning" ? "primary" : "textInverted",
  ),
}));
const iconOnly = computed(() => Boolean(props.icon && !slots.default));
const label = computed(() =>
  typeof attrs["aria-label"] === "string"
    ? attrs["aria-label"]
    : iconOnly.value
      ? props.icon?.replace(/_/g, " ")
      : undefined,
);
function click(event: MouseEvent): void {
  if (!props.disabled && !props.loading) emit("click", event);
}
</script>

<template>
  <button
    :type="type"
    class="h-ui h-button h-focus relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-(--h-control-radius) border text-sm leading-5 font-medium disabled:cursor-default"
    :class="[
      SIZES[size] ?? SIZES.medium,
      VARIANTS[variant] ?? VARIANTS.solid,
      { 'h-button-icon-only': iconOnly, 'h-button-disabled': disabled },
    ]"
    :style="palette"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    :aria-label="label"
    @click="click"
  >
    <span
      class="inline-flex items-center justify-center gap-1"
      :class="{ 'opacity-0': loading }"
    >
      <slot name="prepend"
        ><HIcon v-if="icon" :name="icon" size="1.25rem"
      /></slot>
      <slot />
      <slot name="append" />
    </span>
    <span
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center"
    >
      <slot name="loading"
        ><HProgressCircle size="small" indeterminate aria-label="Loading"
      /></slot>
    </span>
  </button>
</template>

<style scoped>
@layer components {
  .h-button-solid {
    color: var(--h-action-foreground);
    background: var(--h-action-fill);
    border-color: transparent;
  }
  .h-button-outlined {
    color: var(--h-action-text);
    background: transparent;
    border-color: currentColor;
  }
  .h-button-quiet {
    color: var(--h-action-text);
    background: transparent;
    border-color: transparent;
  }
  .h-button-small {
    --h-button-height: var(--h-button-small-height);
  }
  .h-button-medium {
    --h-button-height: var(--h-control-height);
  }
  .h-button-large {
    --h-button-height: var(--h-button-large-height);
  }
  .h-button-icon-only {
    width: var(--h-button-height);
    height: var(--h-button-height);
    padding: 0;
  }
}
.h-button-disabled {
  color: var(--color-secondary);
  background: var(--color-background-element);
  border-color: var(--color-background-border);
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
