<script setup lang="ts" generic="T extends object">
// Adapted from VaSelect's value/text mapping, search and keyboard selection.
import { computed, nextTick, onUnmounted, ref, useId, watch } from "vue";
import { DropdownService } from "../services/DropdownService";
import HIcon from "./HIcon.vue";
import HProgressCircle from "./HProgressCircle.vue";
const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: T[];
    valueBy: keyof T & string;
    textBy: keyof T & string;
    label?: string;
    searchable?: boolean;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  { options: () => [] },
);
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const id = `h-select-${useId()}`;
const root = ref<HTMLElement>();
const control = ref<HTMLInputElement>();
const popup = ref<HTMLElement>();
const open = ref(false);
const query = ref("");
const active = ref(-1);
const dropdown = new DropdownService();
const text = (option: T) => String(option[props.textBy] ?? "");
const value = (option: T) => String(option[props.valueBy] ?? "");
const selectedText = computed(() => {
  const option = props.options.find((item) => value(item) === props.modelValue);
  return option ? text(option) : "";
});
const filtered = computed(() =>
  props.options.filter((option) =>
    text(option).toLocaleLowerCase().includes(query.value.toLocaleLowerCase()),
  ),
);
function close() {
  open.value = false;
  query.value = "";
  active.value = -1;
}
function show() {
  if (props.disabled || props.loading || open.value) return;
  open.value = true;
  active.value = Math.max(
    0,
    filtered.value.findIndex((option) => value(option) === props.modelValue),
  );
}
function select(option: T) {
  if (props.disabled || props.loading) return;
  emit("update:modelValue", value(option));
  close();
  control.value?.focus();
}
function keydown(event: KeyboardEvent) {
  if (props.disabled || props.loading) return;
  if (event.key === "Tab") {
    close();
    return;
  }
  if (event.key === "Escape" && open.value) {
    event.preventDefault();
    event.stopPropagation();
    close();
    return;
  }
  if (["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(event.key)) {
    if (!open.value && !["ArrowDown", "ArrowUp", "Enter"].includes(event.key))
      return;
    event.preventDefault();
    if (!open.value) {
      show();
      return;
    }
    if (event.key === "Enter") {
      const option = filtered.value[active.value];
      if (option) select(option);
      return;
    }
    if (event.key === "Home") active.value = 0;
    else if (event.key === "End") active.value = filtered.value.length - 1;
    else
      active.value = Math.max(
        0,
        Math.min(
          filtered.value.length - 1,
          active.value + (event.key === "ArrowDown" ? 1 : -1),
        ),
      );
    void nextTick(() =>
      popup.value
        ?.querySelector(`#${id}-option-${active.value}`)
        ?.scrollIntoView?.({ block: "nearest" }),
    );
  }
}
function input(event: Event) {
  show();
  query.value = (event.target as HTMLInputElement).value;
  active.value = 0;
}
function outside(event: PointerEvent) {
  if (
    !root.value?.contains(event.target as Node) &&
    !popup.value?.contains(event.target as Node)
  )
    close();
}
watch(
  open,
  async (isOpen) => {
    dropdown.close();
    document.removeEventListener("pointerdown", outside);
    if (!isOpen) return;
    await nextTick();
    if (!open.value || !root.value || !popup.value) return;
    dropdown.open(root.value, popup.value);
    document.addEventListener("pointerdown", outside);
  },
  { flush: "post" },
);
watch(
  () => [props.disabled, props.loading],
  () => {
    if (props.disabled || props.loading) close();
  },
);
watch(filtered, () => {
  active.value = Math.min(Math.max(0, active.value), filtered.value.length - 1);
});
onUnmounted(() => {
  open.value = false;
  dropdown.close();
  document.removeEventListener("pointerdown", outside);
});
</script>
<template>
  <div
    ref="root"
    class="h-ui text-text-primary relative min-w-0"
    :class="{ 'opacity-50': disabled }"
  >
    <label
      v-if="label"
      :for="id"
      class="h-control-label text-text-primary block"
      >{{ label }}</label
    >
    <div
      class="h-field-control flex items-center gap-2 px-3"
      :aria-busy="loading"
    >
      <input
        :id="id"
        ref="control"
        class="h-select-input w-full min-w-0 bg-transparent outline-none"
        role="combobox"
        :aria-label="label"
        :aria-expanded="open"
        :aria-controls="open ? `${id}-list` : undefined"
        :aria-activedescendant="
          open && active >= 0 ? `${id}-option-${active}` : undefined
        "
        :aria-autocomplete="searchable ? 'list' : 'none'"
        aria-haspopup="listbox"
        autocomplete="off"
        :disabled="disabled"
        :readonly="!searchable || loading"
        :value="open && searchable ? query : selectedText"
        :placeholder="open ? selectedText : undefined"
        @click="show"
        @input="input"
        @keydown="keydown"
        @blur="close"
      />
      <HProgressCircle v-if="loading" size="small" indeterminate /><HIcon
        v-else
        name="expand_more"
        class="pointer-events-none"
      />
    </div>
    <Teleport to="body"
      ><div
        v-if="open"
        :id="`${id}-list`"
        ref="popup"
        role="listbox"
        :aria-label="label"
        class="h-ui text-text-primary border-control-border bg-background-secondary fixed z-(--h-dropdown-z-index) overflow-y-auto rounded-(--h-control-radius) border p-1"
        @pointerdown.prevent
      >
        <div
          v-for="(option, index) in filtered"
          :id="`${id}-option-${index}`"
          :key="value(option)"
          role="option"
          :aria-selected="value(option) === modelValue"
          class="flex min-h-(--h-control-height) cursor-pointer items-center rounded-(--h-control-radius) px-3 py-2"
          :class="[
            value(option) === modelValue
              ? 'bg-selection text-primary font-medium'
              : index === active
                ? 'bg-background-element'
                : '',
          ]"
          @mousemove="active = index"
          @click="select(option)"
        >
          {{ text(option) }}
        </div>
        <div
          v-if="!filtered.length"
          role="status"
          class="text-secondary px-3 py-2"
        >
          {{ options.length ? "No options found" : "No options" }}
        </div>
      </div></Teleport
    >
  </div>
</template>
