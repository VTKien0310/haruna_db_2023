<script setup lang="ts">
import {
  computed,
  inject,
  onUnmounted,
  ref,
  useAttrs,
  useId,
  type StyleValue,
} from "vue";
import HFieldFrame from "./HFieldFrame.vue";
import { FieldService } from "../services/FormService";
import { FORM_KEY, type HTextareaProps } from "../types/UiTypes";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<HTextareaProps>(), {
  modelValue: "",
  rules: () => [],
  rows: 2,
});
const emit = defineEmits<{
  "update:modelValue": [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();
const control = ref<HTMLTextAreaElement>();
const attrs = useAttrs();
const generatedId = `h-field-${useId()}`;
const controlId = () => (typeof attrs.id === "string" ? attrs.id : generatedId);
const nativeAttrs = () =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key !== "class" && key !== "style"),
  );
const field = new FieldService({
  value: () => props.modelValue,
  rules: () => props.rules,
  disabled: () => Boolean(props.disabled),
  update: (value) => emit("update:modelValue", value),
  control: () => control.value,
});
const unregister = inject(FORM_KEY, undefined)?.register(field);
onUnmounted(() => unregister?.());
const errors = computed(() => field.visibleErrors);
const describedBy = () =>
  [
    attrs["aria-describedby"],
    errors.value.length ? `${controlId()}-errors` : undefined,
  ]
    .filter(Boolean)
    .join(" ") || undefined;
function input(event: Event): void {
  emit("update:modelValue", (event.target as HTMLTextAreaElement).value);
}
function blur(event: FocusEvent): void {
  field.validate();
  emit("blur", event);
}
defineExpose({
  focus: () => field.focus(),
  blur: () => field.blur(),
  reset: () => field.reset(),
  validate: () => field.validate(),
  resetValidation: () => field.resetValidation(),
});
const rowCount = computed(() =>
  Number.isFinite(props.rows) ? Math.max(1, Math.floor(props.rows)) : 2,
);
</script>

<template>
  <HFieldFrame
    :class="attrs.class"
    :style="attrs.style as StyleValue"
    :control-id="controlId()"
    :label="label"
    :errors="errors"
    :loading="loading"
    :disabled="disabled"
    :readonly="readonly"
    :count="counter ? modelValue.length : undefined"
  >
    <textarea
      v-bind="nativeAttrs()"
      :id="controlId()"
      ref="control"
      class="h-field-input text-text-primary h-full w-full min-w-0 flex-1 resize-none bg-transparent py-3 text-base outline-none"
      :value="modelValue"
      :rows="rowCount"
      :name="name"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :aria-label="
        typeof attrs['aria-label'] === 'string' ? attrs['aria-label'] : label
      "
      :aria-invalid="errors.length > 0"
      :aria-describedby="describedBy()"
      @input="input"
      @blur="blur"
      @focus="emit('focus', $event)"
    />
  </HFieldFrame>
</template>
