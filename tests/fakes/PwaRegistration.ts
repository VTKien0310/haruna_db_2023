import { ref } from "vue";
import { vi } from "vitest";

export const needRefresh = ref(false);
export const offlineReady = ref(false);
export const updateServiceWorker = vi.fn(async () => {});
export const useRegisterSW = vi.fn(() => ({
  needRefresh,
  offlineReady,
  updateServiceWorker,
}));
