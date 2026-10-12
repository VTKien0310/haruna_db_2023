<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, useId, watch } from "vue";
import HButton from "./HButton.vue";
import { OverlayService } from "../services/OverlayService";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    id?: string;
    title?: string;
    message?: string;
    hideDefaultActions?: boolean;
    noDismiss?: boolean;
    noOutsideDismiss?: boolean;
    noEscDismiss?: boolean;
    okText?: string;
    cancelText?: string;
  }>(),
  { okText: "OK", cancelText: "Cancel" },
);
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  ok: [];
  cancel: [];
}>();
const generatedId = `h-modal-${useId()}`;
const id = computed(() => props.id ?? generatedId);
const dialog = ref<HTMLElement>();
let overlay: OverlayService | undefined;
let disposed = false;
function cancel() {
  emit("cancel");
  emit("update:modelValue", false);
}
function confirm() {
  emit("ok");
  emit("update:modelValue", false);
}
function outside() {
  if (!props.noDismiss && !props.noOutsideDismiss && overlay?.isTop) cancel();
}
watch(
  () => props.modelValue,
  async (visible) => {
    overlay?.close();
    overlay = undefined;
    if (!visible) return;
    await nextTick();
    if (disposed || !props.modelValue || !dialog.value) return;
    overlay = new OverlayService(
      dialog.value,
      cancel,
      () => !props.noDismiss && !props.noEscDismiss,
    );
    overlay.open();
  },
  { immediate: true, flush: "post" },
);
onUnmounted(() => {
  disposed = true;
  overlay?.close();
});
</script>
<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="h-ui h-modal-backdrop fixed inset-0 z-(--h-modal-z-index) flex items-center justify-center bg-(--h-overlay-color) p-4"
      @click.self="outside"
    >
      <section
        v-bind="$attrs"
        ref="dialog"
        :id="id"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? `${id}-title` : undefined"
        :aria-label="!title ? 'Dialog' : undefined"
        :aria-describedby="message ? `${id}-message` : undefined"
        tabindex="-1"
        class="bg-background-secondary text-text-primary border-background-border relative max-h-full w-full max-w-(--h-modal-width) overflow-y-auto rounded-(--h-panel-radius) border p-6 outline-none"
      >
        <div v-if="!noDismiss" class="absolute top-2 right-2">
          <HButton
            icon="close"
            preset="plain"
            color="secondary"
            aria-label="Close dialog"
            @click="cancel"
          />
        </div>
        <h2
          v-if="title"
          :id="`${id}-title`"
          class="mb-6 pr-10 text-xl font-semibold"
        >
          {{ title }}
        </h2>
        <p v-if="message" :id="`${id}-message`">{{ message }}</p>
        <slot />
        <div v-if="!hideDefaultActions" class="mt-6 flex justify-end gap-2">
          <HButton preset="secondary" @click="cancel">{{ cancelText }}</HButton
          ><HButton @click="confirm">{{ okText }}</HButton>
        </div>
      </section>
    </div>
  </Teleport>
</template>
