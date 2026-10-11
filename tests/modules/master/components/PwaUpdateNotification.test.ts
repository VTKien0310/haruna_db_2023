import { describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import PwaUpdateNotification from "@/modules/master/components/PwaUpdateNotification.vue";
import { usePwaUpdateStore } from "@/modules/master/stores/PwaUpdateStore";
import { appMountOptions } from "../../../support/mountApp";

describe("PwaUpdateNotification", () => {
  it("offers restart only when an update is available", async () => {
    const store = usePwaUpdateStore();
    const update = vi.fn(async () => {});
    store.updateServiceWorker = update;
    const wrapper = mount(PwaUpdateNotification, appMountOptions());
    expect(wrapper.find("button").exists()).toBe(false);
    store.needRefresh = true;
    await flushPromises();
    await wrapper.get("button").trigger("click");
    expect(update).toHaveBeenCalledOnce();
  });
});
