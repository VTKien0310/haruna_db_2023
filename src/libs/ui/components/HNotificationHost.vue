<script setup lang="ts">
import HButton from "./HButton.vue";
import HModal from "./HModal.vue";
import HIcon from "./HIcon.vue";
import { colorVariable } from "../types/UiTypes";
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
      class="bg-background-secondary text-text-primary border-background-border pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-(--h-control-radius) border border-l-4 py-2 pr-2 pl-3"
      :style="{ borderLeftColor: colorVariable(toast.color ?? 'primary') }"
      :role="toast.color === 'danger' ? 'alert' : 'status'"
    >
      <HIcon
        :name="
          toast.color === 'success'
            ? 'check_circle'
            : toast.color === 'danger'
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
        variant="quiet"
        color="primary"
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
