<script setup lang="ts">
import HButton from "./HButton.vue";
import HModal from "./HModal.vue";
import HIcon from "./HIcon.vue";
import type { NotificationService } from "../services/NotificationService";
const props = defineProps<{ service: NotificationService }>();
const toasts = props.service.toasts;
const confirmations = props.service.confirmations;
</script>
<template>
  <div
    class="h-ui pointer-events-none fixed top-4 right-4 left-4 z-(--h-toast-z-index) flex flex-col items-end gap-2"
    aria-label="Notifications"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="h-snackbar bg-inverse-surface text-inverse-on-surface shadow-level-3 rounded-extra-small pointer-events-auto flex w-full max-w-sm items-center gap-3 px-3 py-2"
      :role="toast.color === 'error' ? 'alert' : 'status'"
    >
      <HIcon
        :name="
          toast.color === 'success'
            ? 'check_circle'
            : toast.color === 'error'
              ? 'error'
              : toast.color === 'warning'
                ? 'warning'
                : 'info'
        "
        :color="toast.color ?? 'primary'"
        aria-hidden="true"
      />
      <span class="min-w-0 flex-1 break-words">{{ toast.message }}</span
      ><HButton
        icon="close"
        variant="text"
        color="primary"
        class="h-snackbar-action"
        aria-label="Dismiss notification"
        @click="service.dismissToast(toast.id)"
      />
    </div>
  </div>
  <HModal
    v-for="entry in confirmations"
    :key="entry.id"
    :id="entry.id"
    :model-value="true"
    :message="entry.message"
    :title="entry.title"
    :ok-text="entry.okText"
    :cancel-text="entry.cancelText"
    @ok="service.settle(entry.id, true)"
    @cancel="service.settle(entry.id, false)"
  />
</template>

<style scoped>
.h-snackbar-action {
  color: var(--color-inverse-primary);
}
</style>
