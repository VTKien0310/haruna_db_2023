import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { PwaUpdateService } from "@/modules/master/services/PwaUpdateService";
import { usePwaUpdateStore } from "@/modules/master/stores/PwaUpdateStore";
import {
  needRefresh,
  offlineReady,
  updateServiceWorker,
} from "../../../fakes/PwaRegistration";

describe("PwaUpdateService", () => {
  it("synchronizes flags and disposes watchers on stop", async () => {
    const service = new PwaUpdateService();
    service.startWatching();
    try {
      needRefresh.value = true;
      offlineReady.value = true;
      await nextTick();
      expect(usePwaUpdateStore()).toMatchObject({
        needRefresh: true,
        offlineReady: true,
        updateServiceWorker,
      });
      service.stopWatching();
      needRefresh.value = false;
      await nextTick();
      expect(usePwaUpdateStore().needRefresh).toBe(true);
      expect(usePwaUpdateStore().updateServiceWorker).toBeNull();
    } finally {
      service.stopWatching();
    }
  });
  it("can restart watching safely", async () => {
    const service = new PwaUpdateService();
    service.startWatching();
    service.startWatching();
    try {
      needRefresh.value = true;
      await nextTick();
      expect(usePwaUpdateStore().needRefresh).toBe(true);
    } finally {
      service.stopWatching();
    }
  });
});
