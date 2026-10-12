<script setup lang="ts">
// Adapted from VaFileUpload's file selection, append, remove and input reset.
import { ref } from "vue";
import HButton from "./HButton.vue";
const props = withDefaults(
  defineProps<{
    modelValue: File[];
    disabled?: boolean;
    fileTypes?: string;
    dropzone?: boolean;
    uploadButtonText?: string;
    dropZoneText?: string;
  }>(),
  {
    disabled: false,
    dropzone: false,
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
const input = ref<HTMLInputElement>();
const dragging = ref(false);
const error = ref("");
function accepts(file: File): boolean {
  if (!props.fileTypes) return true;
  return props.fileTypes
    .toLowerCase()
    .split(",")
    .map((type) => type.trim())
    .filter(Boolean)
    .some((type) =>
      type.startsWith(".")
        ? file.name.toLowerCase().endsWith(type)
        : type.endsWith("/*")
          ? file.type.toLowerCase().startsWith(type.slice(0, -1))
          : file.type.toLowerCase() === type,
    );
}
function add(files: FileList | null | undefined) {
  if (props.disabled || !files) return;
  const selected = Array.from(files);
  const valid = selected.filter(accepts);
  error.value =
    valid.length < selected.length
      ? "Some files have an unsupported file type."
      : "";
  if (valid.length) {
    emit("update:modelValue", [...props.modelValue, ...valid]);
    emit("file-added", valid);
  }
  if (input.value) input.value.value = "";
}
function drop(event: DragEvent) {
  dragging.value = false;
  if (props.dropzone) add(event.dataTransfer?.files);
}
function remove(index: number) {
  const file = props.modelValue[index];
  if (props.disabled || !file) return;
  emit(
    "update:modelValue",
    props.modelValue.filter((_, fileIndex) => index !== fileIndex),
  );
  emit("file-removed", file);
}
</script>
<template>
  <div
    class="h-ui text-text-primary w-full rounded-(--h-control-radius) p-4"
    :class="[
      dropzone
        ? 'bg-background-primary border-control-border border border-dashed'
        : '',
      dragging ? 'bg-selection border-primary' : '',
      disabled ? 'opacity-50' : '',
    ]"
    :aria-disabled="disabled"
    @dragover.prevent="dragging = dropzone && !disabled"
    @dragleave.prevent="dragging = false"
    @drop.prevent="drop"
  >
    <div class="flex flex-wrap items-center justify-center gap-3 py-2">
      <span v-if="dropzone">{{ dropZoneText }}</span
      ><HButton
        preset="secondary"
        :disabled="disabled"
        @click="input?.click()"
        >{{ uploadButtonText }}</HButton
      >
    </div>
    <input
      ref="input"
      type="file"
      class="hidden"
      tabindex="-1"
      aria-hidden="true"
      :accept="fileTypes"
      multiple
      :disabled="disabled"
      @change="add(($event.target as HTMLInputElement).files)"
    />
    <p v-if="error" role="alert" class="text-danger mt-2">{{ error }}</p>
    <ul v-if="modelValue.length" class="divide-background-border mt-4 divide-y">
      <li
        v-for="(file, index) in modelValue"
        :key="index"
        class="flex items-center gap-3 py-2"
      >
        <span class="min-w-0 flex-1 truncate">{{ file.name }}</span
        ><span class="text-secondary text-sm"
          >{{ (file.size / 1024).toFixed(1) }} KB</span
        ><HButton
          icon="close"
          preset="plain"
          :aria-label="`Remove ${file.name}`"
          :disabled="disabled"
          @click="remove(index)"
        />
      </li>
    </ul>
  </div>
</template>
