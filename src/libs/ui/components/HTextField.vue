<script setup lang="ts">
// Adapted from VaInput, VaTextarea and VaInputWrapper; see ../LICENSE.
import { computed, inject, onUnmounted, ref, useAttrs, useId } from "vue";
import { FieldService } from "../services/FormService";
import { FORM_KEY, colorVariable, type HTextareaProps } from "../types/UiTypes";
import HProgressCircle from "./HProgressCircle.vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<HTextareaProps & { multiline?: boolean }>(),
  {
    modelValue: "",
    type: "text",
    rules: () => [],
    minRows: 2,
    resize: true,
    background: "backgroundSecondary",
  },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();
const attrs = useAttrs();
const id = useId();
const controlId = computed(() =>
  typeof attrs.id === "string" ? attrs.id : `h-field-${id}`,
);
const control = ref<HTMLInputElement | HTMLTextAreaElement>();
const touched = ref(false);
const service = new FieldService(
  () => props.modelValue,
  () => props.rules,
  () => props.disabled || false,
  touched,
  (value) => emit("update:modelValue", value),
  () => control.value?.focus(),
);
const unregister = inject(FORM_KEY, undefined)?.register(service);
onUnmounted(() => unregister?.());
const errors = computed(() => service.visibleErrors);
const inputAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key !== "class" && key !== "style"),
  ),
);
const describedBy = computed(
  () =>
    [
      attrs["aria-describedby"],
      errors.value.length ? `${controlId.value}-errors` : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined,
);
const update = (event: Event) =>
  emit("update:modelValue", (event.target as HTMLInputElement).value);
const onBlur = (event: FocusEvent) => {
  service.validate();
  emit("blur", event);
};
// The app uses fixed rows (Vuestic's default autosize=false), or a CSS height.
const rows = computed(() => Math.max(1, props.maxRows ?? props.minRows));
defineExpose({
  focus: () => control.value?.focus(),
  blur: () => control.value?.blur(),
  reset: () => service.reset(),
  validate: () => service.validate(),
  resetValidation: () => service.resetValidation(),
});
</script>

<template>
  <div
    class="h-ui h-text-field text-text-primary inline-flex min-w-0 flex-col"
    :class="[attrs.class, { 'opacity-50': disabled }]"
    :style="[
      attrs.style as string,
      { '--h-field-background': colorVariable(background) },
    ]"
  >
    <label
      v-if="label"
      :for="controlId"
      class="h-control-label text-text-primary"
      >{{ label }}</label
    >
    <div
      class="h-field-control flex min-w-0 items-center gap-2 px-3"
      :class="{ 'min-h-0 flex-1 py-3': multiline }"
      :aria-invalid="errors.length > 0"
      :aria-busy="loading"
    >
      <component
        :is="multiline ? 'textarea' : 'input'"
        v-bind="inputAttrs"
        :id="controlId"
        ref="control"
        class="text-text-primary w-full min-w-0 flex-1 bg-transparent text-base outline-none"
        :class="{ 'h-full': multiline }"
        :style="{
          lineHeight: 'var(--h-input-line-height)',
          resize: multiline ? (resize ? 'vertical' : 'none') : undefined,
        }"
        :value="modelValue"
        :type="multiline ? undefined : type"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :rows="multiline ? rows : undefined"
        :aria-label="attrs['aria-label'] ?? label"
        :aria-invalid="errors.length > 0"
        :aria-describedby="describedBy"
        @input="update"
        @blur="onBlur"
        @focus="emit('focus', $event)"
      />
      <HProgressCircle
        v-if="loading"
        size="small"
        indeterminate
        aria-label="Loading"
      />
    </div>
    <div
      v-if="errors.length"
      :id="`${controlId}-errors`"
      class="text-danger text-sm"
      role="alert"
    >
      <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
    </div>
    <span v-if="counter" class="text-secondary text-right text-xs">{{
      modelValue.length
    }}</span>
  </div>
</template>
