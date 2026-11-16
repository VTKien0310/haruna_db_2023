<script setup lang="ts">
import { computed, useAttrs, type VNode } from "vue";
import {
  actionColor,
  colorVariable,
  type HActionColor,
  type HButtonShape,
  type HButtonSize,
  type HButtonVariant,
  type HColor,
} from "../types/UiTypes";
import HIcon from "./HIcon.vue";
import HProgressCircle from "./HProgressCircle.vue";

const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset";
    variant?: HButtonVariant;
    color?: HActionColor;
    size?: HButtonSize;
    shape?: HButtonShape;
    icon?: string;
    disabled?: boolean;
    loading?: boolean;
  }>(),
  {
    type: "button",
    variant: "filled",
    color: "primary",
    size: "small",
    shape: "round",
  },
);
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const slots = defineSlots<{
  default?: () => VNode[];
  prepend?: () => VNode[];
  append?: () => VNode[];
  loading?: () => VNode[];
}>();
const attrs = useAttrs();
const SIZES: Record<HButtonSize, string> = {
  xsmall: "h-button-size-xsmall h-8 px-3 text-label-small",
  small: "h-button-size-small h-10 px-4 text-label-large",
  medium: "h-button-size-medium h-14 px-6 text-title-small",
  large: "h-button-size-large h-24 px-8 text-title-medium",
  xlarge: "h-button-size-xlarge h-34 px-10 text-title-large",
};
const VARIANTS: Record<HButtonVariant, string> = {
  filled: "h-button-filled",
  tonal: "h-button-tonal",
  outlined: "h-button-outlined",
  text: "h-button-text",
  elevated: "h-button-elevated",
};
const SHAPES: Record<HButtonShape, string> = {
  round: "h-button-shape-round",
  square: "h-button-shape-square",
};
const tone = computed(() => actionColor(props.color));
const variantClass = computed(() => VARIANTS[props.variant] ?? VARIANTS.filled);
const sizeClass = computed(() => SIZES[props.size] ?? SIZES.small);
const shapeClass = computed(() => SHAPES[props.shape] ?? SHAPES.round);
const buttonColors = computed(() => {
  const onColor =
    `on${tone.value[0].toUpperCase()}${tone.value.slice(1)}` as HColor;
  const container = `${tone.value}Container` as HColor;
  const onContainer =
    `on${tone.value[0].toUpperCase()}${tone.value.slice(1)}Container` as HColor;

  if (props.variant === "tonal") {
    return {
      "--h-btn-container": colorVariable(container),
      "--h-btn-content": colorVariable(onContainer),
      "--h-btn-outline": "transparent",
    };
  }
  if (props.variant === "outlined" || props.variant === "text") {
    return {
      "--h-btn-container": "transparent",
      "--h-btn-content": colorVariable(tone.value),
      "--h-btn-outline": colorVariable("outlineVariant"),
    };
  }
  if (props.variant === "elevated") {
    return {
      "--h-btn-container": "var(--color-surface-container-low)",
      "--h-btn-content": colorVariable(tone.value),
      "--h-btn-outline": "transparent",
    };
  }
  return {
    "--h-btn-container": colorVariable(tone.value),
    "--h-btn-content": colorVariable(onColor),
    "--h-btn-outline": "transparent",
  };
});
const iconSize = computed(
  () =>
    ({
      xsmall: "1rem",
      small: "1.25rem",
      medium: "1.5rem",
      large: "2rem",
      xlarge: "2.5rem",
    })[props.size] ?? "1.25rem",
);
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
    class="h-ui h-button h-focus relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 border font-medium disabled:cursor-default"
    :class="[
      sizeClass,
      variantClass,
      shapeClass,
      { 'h-button-icon-only': iconOnly, 'h-button-disabled': disabled },
    ]"
    :style="buttonColors"
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
        ><HIcon v-if="icon" :name="icon" :size="iconSize"
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
  .h-button-filled {
    color: var(--h-btn-content);
    background: var(--h-btn-container);
    border-color: transparent;
  }
  .h-button-tonal {
    color: var(--h-btn-content);
    background: var(--h-btn-container);
    border-color: transparent;
  }
  .h-button-outlined {
    color: var(--h-btn-content);
    background: transparent;
    border-color: var(--h-btn-outline);
  }
  .h-button-text {
    color: var(--h-btn-content);
    background: transparent;
    border-color: transparent;
  }
  .h-button-elevated {
    color: var(--h-btn-content);
    background: var(--h-btn-container);
    border-color: transparent;
    box-shadow: var(--shadow-level-1);
  }
  .h-button-size-xsmall {
    --h-button-height: 2rem;
    min-width: 4rem;
  }
  .h-button-size-small {
    --h-button-height: 2.5rem;
    min-width: 4rem;
  }
  .h-button-size-medium {
    --h-button-height: 3.5rem;
    min-width: 5rem;
  }
  .h-button-size-large {
    --h-button-height: 6rem;
    min-width: 6rem;
  }
  .h-button-size-xlarge {
    --h-button-height: 8.5rem;
    min-width: 8.5rem;
  }
  .h-button-icon-only {
    width: var(--h-button-height);
    height: var(--h-button-height);
    min-width: var(--h-button-height);
    padding: 0;
  }
  .h-button-shape-round {
    border-radius: 9999px;
  }
  .h-button-shape-square {
    border-radius: var(--radius-small);
  }
}
.h-button-disabled {
  color: var(--color-disabled-content);
  background: var(--color-disabled-container);
  border-color: transparent;
  box-shadow: none;
}
.h-button:not(:disabled) {
  transition:
    background-color var(--duration-effects-fast) var(--ease-effects-default),
    border-color var(--duration-effects-fast) var(--ease-effects-default),
    border-radius var(--duration-spatial-fast) var(--ease-spatial-fast),
    box-shadow var(--duration-effects-fast) var(--ease-effects-default);
}
.h-button:not(:disabled):active.h-button-shape-round {
  border-radius: var(--radius-large);
}
.h-button:not(:disabled):active.h-button-shape-square {
  border-radius: var(--radius-extra-large);
}
.h-button::before {
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100%, 3rem);
  height: max(100%, 3rem);
  transform: translate(-50%, -50%);
  content: "";
  pointer-events: auto;
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
  opacity: 0.1;
}
</style>
