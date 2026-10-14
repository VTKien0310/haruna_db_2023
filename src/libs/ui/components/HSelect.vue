<script setup lang="ts" generic="T extends object">
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
const anchor = ref<HTMLElement>();
const list = ref<HTMLElement>();
const input = ref<HTMLInputElement>();
const expanded = ref(false);
const search = ref("");
const highlighted = ref(-1);
const placement = new DropdownService();
let revision = 0;
const unavailable = computed(() => Boolean(props.disabled || props.loading));
const choices = computed(() =>
  props.options.map((option) => ({
    value: String(option[props.valueBy] ?? ""),
    text: String(option[props.textBy] ?? ""),
  })),
);
const selected = computed(
  () =>
    choices.value.find((choice) => choice.value === props.modelValue)?.text ??
    "",
);
const visible = computed(() =>
  choices.value.filter((choice) =>
    choice.text.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()),
  ),
);

function dismiss(): void {
  expanded.value = false;
  search.value = "";
  highlighted.value = -1;
}
function open(): void {
  if (unavailable.value || expanded.value) return;
  expanded.value = true;
  const selectedIndex = visible.value.findIndex(
    (choice) => choice.value === props.modelValue,
  );
  highlighted.value = visible.value.length ? Math.max(0, selectedIndex) : -1;
}
function choose(value: string): void {
  if (unavailable.value) return;
  emit("update:modelValue", value);
  dismiss();
  input.value?.focus();
}
function query(event: Event): void {
  if (unavailable.value || !props.searchable) return;
  open();
  search.value = (event.target as HTMLInputElement).value;
  highlighted.value = visible.value.length ? 0 : -1;
}
function reveal(): void {
  void nextTick(() =>
    list.value?.children[highlighted.value]?.scrollIntoView?.({
      block: "nearest",
    }),
  );
}
function keydown(event: KeyboardEvent): void {
  if (unavailable.value) return;
  switch (event.key) {
    case "Tab":
      dismiss();
      return;
    case "Escape":
      if (expanded.value) {
        event.preventDefault();
        event.stopPropagation();
        dismiss();
      }
      return;
    case "Enter":
      event.preventDefault();
      if (!expanded.value) open();
      else {
        const choice = visible.value[highlighted.value];
        if (choice) choose(choice.value);
      }
      return;
    case "ArrowUp":
    case "ArrowDown":
      event.preventDefault();
      if (!expanded.value) open();
      else
        highlighted.value = Math.max(
          0,
          Math.min(
            visible.value.length - 1,
            highlighted.value + (event.key === "ArrowDown" ? 1 : -1),
          ),
        );
      break;
    case "Home":
    case "End":
      if (!expanded.value) return;
      event.preventDefault();
      highlighted.value = event.key === "Home" ? 0 : visible.value.length - 1;
      break;
    default:
      return;
  }
  if (!visible.value.length) highlighted.value = -1;
  reveal();
}
function outside(event: PointerEvent): void {
  const target = event.target as Node;
  if (!anchor.value?.contains(target) && !list.value?.contains(target))
    dismiss();
}
function cleanup(): void {
  placement.close();
  document.removeEventListener("pointerdown", outside);
}
watch(
  expanded,
  async (opened) => {
    const current = ++revision;
    cleanup();
    if (!opened) return;
    await nextTick();
    if (current !== revision || !expanded.value || !anchor.value || !list.value)
      return;
    placement.open(anchor.value, list.value);
    document.addEventListener("pointerdown", outside);
  },
  { flush: "post" },
);
watch(unavailable, (blocked) => {
  if (blocked) dismiss();
});
watch(visible, (options) => {
  highlighted.value = options.length
    ? Math.max(0, Math.min(highlighted.value, options.length - 1))
    : -1;
});
onUnmounted(() => {
  revision++;
  cleanup();
});
</script>

<template>
  <div ref="anchor" class="h-ui text-text-primary relative min-w-0">
    <label v-if="label" :for="id" class="h-control-label block">{{
      label
    }}</label>
    <div
      class="h-field-control flex items-center gap-2 px-3"
      :class="{ 'h-field-disabled': disabled }"
      :aria-busy="loading"
    >
      <input
        :id="id"
        ref="input"
        class="h-select-input w-full min-w-0 bg-transparent outline-none"
        role="combobox"
        :aria-label="label"
        :aria-describedby="
          typeof $attrs['aria-describedby'] === 'string'
            ? $attrs['aria-describedby']
            : undefined
        "
        :aria-expanded="expanded"
        :aria-controls="expanded ? `${id}-list` : undefined"
        :aria-activedescendant="
          expanded && highlighted >= 0
            ? `${id}-option-${highlighted}`
            : undefined
        "
        :aria-autocomplete="searchable ? 'list' : 'none'"
        aria-haspopup="listbox"
        autocomplete="off"
        :disabled="disabled"
        :readonly="!searchable || loading"
        :value="expanded && searchable ? search : selected"
        :placeholder="expanded ? selected : undefined"
        @click="open"
        @input="query"
        @keydown="keydown"
        @blur="dismiss"
      />
      <HProgressCircle
        v-if="loading"
        size="small"
        indeterminate
        aria-label="Loading"
      />
      <HIcon v-else name="expand_more" class="pointer-events-none" />
    </div>
    <Teleport to="body">
      <div
        v-if="expanded"
        :id="`${id}-list`"
        ref="list"
        role="listbox"
        :aria-label="label"
        class="h-ui text-text-primary border-control-border bg-background-secondary fixed z-(--h-dropdown-z-index) overflow-y-auto rounded-(--h-control-radius) border p-1"
        @pointerdown.prevent
      >
        <div
          v-for="(choice, index) in visible"
          :id="`${id}-option-${index}`"
          :key="choice.value"
          role="option"
          :aria-selected="choice.value === modelValue"
          class="flex min-h-(--h-control-height) cursor-pointer items-center rounded-(--h-control-radius) px-3 py-2"
          :class="{
            'h-select-selected': choice.value === modelValue,
            'h-select-highlighted': index === highlighted,
          }"
          @mousemove="highlighted = index"
          @click="choose(choice.value)"
        >
          {{ choice.text }}
        </div>
        <div
          v-if="!visible.length"
          role="status"
          class="text-secondary px-3 py-2"
        >
          {{ options.length ? "No options found" : "No options" }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.h-select-highlighted {
  background: var(--color-background-element);
}
.h-select-selected {
  background: var(--color-selection);
  color: var(--color-primary);
  font-weight: 500;
}
</style>
