<script setup lang="ts">
import { computed, ref } from "vue";
import HButton from "./HButton.vue";

const props = withDefaults(
  defineProps<{
    modelValue: File[];
    disabled?: boolean;
    fileTypes?: string;
    uploadButtonText?: string;
    dropZoneText?: string;
  }>(),
  {
    fileTypes: "",
    uploadButtonText: "Upload file",
    dropZoneText: "Drop files here",
  },
);
const emit = defineEmits<{
  "update:modelValue": [files: File[]];
  "file-added": [files: File[]];
  "file-removed": [file: File];
}>();
const picker = ref<HTMLInputElement>();
const dragging = ref(false);
const rejected = ref(false);
const acceptedTypes = computed(() =>
  props.fileTypes
    .split(",")
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean),
);
function accepts(file: File): boolean {
  if (!acceptedTypes.value.length) return true;
  const filename = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  for (const type of acceptedTypes.value) {
    if (type.startsWith(".") && filename.endsWith(type)) return true;
    if (type === mime) return true;
    if (
      type.endsWith("/*") &&
      mime.startsWith(type.substring(0, type.length - 1))
    )
      return true;
  }
  return false;
}
function add(files: FileList | null | undefined): void {
  if (props.disabled || !files) return;
  const accepted: File[] = [];
  rejected.value = false;
  for (const file of Array.from(files)) {
    if (accepts(file)) accepted.push(file);
    else rejected.value = true;
  }
  if (picker.value) picker.value.value = "";
  if (!accepted.length) return;
  emit("update:modelValue", props.modelValue.concat(accepted));
  emit("file-added", accepted);
}
function choose(): void {
  if (!props.disabled) picker.value?.click();
}
function drop(event: DragEvent): void {
  dragging.value = false;
  add(event.dataTransfer?.files);
}
function remove(index: number): void {
  if (props.disabled) return;
  const remaining = props.modelValue.slice();
  const removed = remaining.splice(index, 1)[0];
  if (!removed) return;
  emit("update:modelValue", remaining);
  emit("file-removed", removed);
}
</script>

<template>
  <div
    class="h-ui text-text-primary border-control-border bg-background-primary w-full rounded-(--h-control-radius) border border-dashed p-4"
    :class="{ 'h-upload-dragging': dragging && !disabled }"
    :aria-disabled="disabled"
    @dragover.prevent="dragging = !disabled"
    @dragleave.prevent="dragging = false"
    @drop.prevent="drop"
  >
    <div class="flex flex-wrap items-center justify-center gap-3 py-2">
      <span>{{ dropZoneText }}</span>
      <HButton variant="outlined" :disabled="disabled" @click="choose">{{
        uploadButtonText
      }}</HButton>
    </div>
    <input
      ref="picker"
      type="file"
      class="hidden"
      tabindex="-1"
      aria-hidden="true"
      :accept="fileTypes"
      multiple
      :disabled="disabled"
      @change="add(($event.target as HTMLInputElement).files)"
    />
    <p v-if="rejected" role="alert" class="text-danger mt-2">
      Some files have an unsupported file type.
    </p>
    <ul v-if="modelValue.length" class="divide-background-border mt-4 divide-y">
      <li
        v-for="(file, index) in modelValue"
        :key="index"
        class="flex items-center gap-3 py-2"
      >
        <span class="min-w-0 flex-1 truncate">{{ file.name }}</span>
        <span class="text-secondary text-sm"
          >{{ (file.size / 1024).toFixed(1) }} KB</span
        >
        <HButton
          icon="close"
          variant="quiet"
          :aria-label="`Remove ${file.name}`"
          :disabled="disabled"
          @click="remove(index)"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.h-upload-dragging {
  background: var(--color-selection);
  border-color: var(--color-primary);
}
</style>
