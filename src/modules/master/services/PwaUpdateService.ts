import { useRegisterSW } from "virtual:pwa-register/vue";
import { watch } from "vue";

import { usePwaUpdateStore } from "@/modules/master/stores/PwaUpdateStore";

export class PwaUpdateService {
  private readonly pwaUpdateStore = usePwaUpdateStore();
  private stopNeedRefreshWatcher: (() => void) | null = null;
  private stopOfflineReadyWatcher: (() => void) | null = null;

  startWatching(): void {
    this.stopWatching();

    const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
      immediate: true,
    });

    this.stopNeedRefreshWatcher = watch(
      needRefresh,
      (value): void => {
        this.pwaUpdateStore.needRefresh = value;
      },
      { immediate: true },
    );

    this.stopOfflineReadyWatcher = watch(
      offlineReady,
      (value): void => {
        this.pwaUpdateStore.offlineReady = value;
      },
      { immediate: true },
    );

    this.pwaUpdateStore.updateServiceWorker = updateServiceWorker;
  }

  stopWatching(): void {
    this.stopNeedRefreshWatcher?.();
    this.stopOfflineReadyWatcher?.();
    this.stopNeedRefreshWatcher = null;
    this.stopOfflineReadyWatcher = null;
    this.pwaUpdateStore.updateServiceWorker = null;
  }
}
