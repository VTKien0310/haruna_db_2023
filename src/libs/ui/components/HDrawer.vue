<script setup lang="ts">
import { nextTick, onUnmounted, ref, useId, watch } from "vue";
import HButton from "./HButton.vue";
import { OverlayService } from "../services/OverlayService";

defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    id?: string;
    label?: string;
    topOffset?: string;
  }>(),
  { label: "Navigation", topOffset: "0" },
);
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
const generatedId = `h-drawer-${useId()}`;
const panel = ref<HTMLElement>();
let overlay: OverlayService | undefined;
let generation = 0;

function close() {
  if (overlay?.isTop) emit("update:modelValue", false);
}
watch(
  () => props.modelValue,
  async (visible) => {
    const current = ++generation;
    overlay?.close();
    overlay = undefined;
    if (!visible) return;
    await nextTick();
    if (generation !== current || !props.modelValue || !panel.value) return;
    overlay = new OverlayService(panel.value, close, () => true);
    overlay.open();
  },
  { immediate: true, flush: "post" },
);
onUnmounted(() => {
  generation++;
  overlay?.close();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="h-drawer">
      <div
        v-if="modelValue"
        class="h-ui h-drawer-backdrop fixed right-0 bottom-0 left-0 z-(--h-drawer-z-index) bg-(--h-overlay-color)"
        :style="{ top: topOffset }"
        @click.self="close"
      >
        <section
          v-bind="$attrs"
          :id="id ?? generatedId"
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-label="label"
          tabindex="-1"
          class="h-drawer-panel bg-background-primary border-background-border absolute top-0 right-0 bottom-0 flex w-(--h-sidebar-width) max-w-[calc(100%_-_2rem)] flex-col overflow-y-auto border-l p-3 outline-none"
        >
          <div class="mb-3 flex shrink-0 justify-end">
            <HButton
              icon="close"
              variant="outlined"
              aria-label="Close navigation"
              @click="close"
            />
          </div>
          <slot />
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.h-drawer-enter-active,
.h-drawer-leave-active,
.h-drawer-enter-active .h-drawer-panel,
.h-drawer-leave-active .h-drawer-panel {
  transition:
    opacity var(--h-motion-duration) ease,
    transform var(--h-motion-duration) ease;
}
.h-drawer-enter-from,
.h-drawer-leave-to {
  opacity: 0;
}
.h-drawer-enter-from .h-drawer-panel,
.h-drawer-leave-to .h-drawer-panel {
  transform: translateX(100%);
}
.h-drawer-leave-active {
  pointer-events: none;
}
</style>
