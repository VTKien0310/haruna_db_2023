import { defineStore } from "pinia";
import { ref } from "vue";

export const usePwaUpdateStore = defineStore("pwa-update", () => {
  const needRefresh = ref(false);
  const offlineReady = ref(false);
  const updateServiceWorker = ref<(() => Promise<void>) | null>(null);

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
  };
});
