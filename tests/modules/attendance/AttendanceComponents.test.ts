import { AttendanceFormService } from "@/modules/attendance/services/AttendanceFormService";
import { AttendancePresentationService } from "@/modules/attendance/services/AttendancePresentationService";
import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import AttendanceEntryForm from "@/modules/attendance/components/AttendanceEntryForm.vue";
import AttendanceBankSummary from "@/modules/attendance/components/AttendanceBankSummary.vue";
import AttendanceNavigation from "@/modules/attendance/components/AttendanceNavigation.vue";
import AttendanceDashboard from "@/modules/attendance/components/AttendanceDashboard.vue";
import { useAttendanceStore } from "@/modules/attendance/AttendanceStore";
import { AttendanceService } from "@/modules/attendance/services/AttendanceService";
import { appMountOptions } from "../../support/mountApp";
import { makeBackendFake, queryResult } from "../../fakes/BackendFake";
import { makeModal, makeToast } from "../../fakes/Collaborators";
import { BackendApiResult } from "@/ports/backend/BackendPortTypes";
import { bank, entry } from "./AttendanceFixtures";
import { t } from "@/modules/attendance/locales";
const display = new AttendancePresentationService();
const forms = new AttendanceFormService(display);
const dependencies = vi.hoisted(() => ({
  service: null as AttendanceService | null,
}));
vi.mock("@/modules/attendance/AttendanceServiceContainer", async () => {
  const { AttendancePresentationService } =
    await import("@/modules/attendance/services/AttendancePresentationService");
  const { AttendanceFormService } =
    await import("@/modules/attendance/services/AttendanceFormService");
  return {
    useAttendancePresentationService: () => new AttendancePresentationService(),
    useAttendanceFormService: () =>
      new AttendanceFormService(new AttendancePresentationService()),
    useAttendanceService: () => dependencies.service,
  };
});
describe("AttendanceComponents", () => {
  it("shows missing banks separately from zero and renders original balances", () => {
    const wrapper = mount(AttendanceBankSummary, {
      ...appMountOptions(),
      props: { bank: null },
    });
    expect(wrapper.text()).toContain(t("noBank"));
    const filled = mount(AttendanceBankSummary, {
      ...appMountOptions(),
      props: { bank: bank(), originals: true },
    });
    expect(filled.text()).toContain("1d 3h 30m");
    expect(filled.text()).toContain("—");
  });
  it("submits real form controls through the service and retains input after failure", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T02:00:00Z"));
    const backend = makeBackendFake(),
      toast = makeToast();
    dependencies.service = new AttendanceService(
      backend.port,
      toast.service,
      display,
      forms,
      makeModal().service,
    );
    dependencies.service!.resetSession("owner");
    const wrapper = mount(AttendanceEntryForm, appMountOptions());
    await wrapper.get("textarea").setValue("Remember this");
    backend.query(queryResult([]));
    backend.post.mockResolvedValueOnce(
      BackendApiResult.err(new Error("offline")),
    );
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect((wrapper.get("textarea").element as HTMLTextAreaElement).value).toBe(
      "Remember this",
    );
    expect(wrapper.emitted("saved")).toBeUndefined();
    backend.query(queryResult([]));
    backend.post.mockResolvedValueOnce(BackendApiResult.ok({}));
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect((wrapper.get("textarea").element as HTMLTextAreaElement).value).toBe(
      "",
    );
  });
  it("validates clock inputs before writes and exposes exemption accessibly", async () => {
    const backend = makeBackendFake();
    dependencies.service = new AttendanceService(
      backend.port,
      makeToast().service,
      display,
      forms,
      makeModal().service,
    );
    dependencies.service!.resetSession("owner");
    const wrapper = mount(AttendanceEntryForm, appMountOptions());
    await wrapper.get("input[type=time]").setValue("");
    await wrapper.get("form").trigger("submit");
    expect(wrapper.get("[role=alert]").text()).toContain(t("timeInvalid"));
    expect(backend.post).not.toHaveBeenCalled();
    const toggle = wrapper.get("button[aria-pressed]");
    expect(toggle.attributes("aria-pressed")).toBe("false");
    await toggle.trigger("click");
    expect(toggle.attributes("aria-pressed")).toBe("true");
  });
  it("prepopulates editing and saves the child through PATCH", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T02:00:00Z"));
    const backend = makeBackendFake();
    dependencies.service = new AttendanceService(
      backend.port,
      makeToast().service,
      display,
      forms,
      makeModal().service,
    );
    dependencies.service!.resetSession("owner");
    const wrapper = mount(AttendanceEntryForm, {
      ...appMountOptions(),
      props: { entry: entry() },
    });
    expect(
      (wrapper.get("input[type=time]").element as HTMLInputElement).value,
    ).toBe("09:00");
    backend.query(queryResult([]));
    backend.patch.mockResolvedValue(BackendApiResult.ok({}));
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(backend.patch).toHaveBeenCalled();
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });
  it("shows unavailable and loading dashboard states with disabled action", async () => {
    dependencies.service = new AttendanceService(
      makeBackendFake().port,
      makeToast().service,
      display,
      forms,
      makeModal().service,
    );
    const store = useAttendanceStore();
    store.state.dashboardStatus = "error";
    const wrapper = mount(AttendanceDashboard, {
      ...appMountOptions(),
      props: { active: false },
    });
    expect(wrapper.text()).toContain(t("loadFailed"));
    expect(wrapper.findAll("button")[0].attributes("disabled")).toBeDefined();
    store.state.dashboardStatus = "loading";
    await flushPromises();
    expect(wrapper.text()).toContain(t("loading"));
  });
  it("alerts when not checked in yet, spans the check-in button full-width, and centers PTO cards on mobile", async () => {
    dependencies.service = new AttendanceService(
      makeBackendFake().port,
      makeToast().service,
      display,
      forms,
      makeModal().service,
    );
    const store = useAttendanceStore();
    store.state.dashboardStatus = "ready";
    store.state.today = "2026-11-17";
    store.state.workStart = "2026-01-01";
    store.state.exceptions = [];
    store.state.todayEntries = [];
    store.state.bank = bank();
    const wrapper = mount(AttendanceDashboard, {
      ...appMountOptions(),
      props: { active: false },
    });
    const alert = wrapper.get('[role="alert"]');
    expect(alert.text()).toContain(t("required"));
    expect(alert.classes()).toContain("bg-error-container");
    expect(alert.classes()).toContain("text-on-error-container");
    expect(wrapper.find('[role="status"]').exists()).toBe(false);

    const checkInButton = wrapper.get("button");
    expect(checkInButton.text()).toBe(t("checkIn"));
    expect(checkInButton.classes()).toContain("w-full");
    expect(checkInButton.attributes("disabled")).toBeUndefined();

    const bankSummary = wrapper.getComponent(AttendanceBankSummary);
    expect(bankSummary.props("centerOnMobile")).toBe(true);
    expect(bankSummary.get("dl").classes()).toContain("grid-cols-3");
    expect(
      wrapper.findAll(".text-center.md\\:text-left").length,
    ).toBeGreaterThanOrEqual(4);

    store.state.todayEntries = [entry()];
    await flushPromises();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    const checkedInStatus = wrapper.get('[role="status"]');
    expect(checkedInStatus.text()).toContain("09:00");
    expect(checkedInStatus.classes()).not.toContain("bg-error-container");
  });
  it("opens navigation for detail routes and supports collapse and links", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/detail",
          name: "attendance.detail",
          component: { template: "<div />" },
        },
        {
          path: "/pto",
          name: "attendance.ledger",
          component: { template: "<div />" },
        },
        {
          path: "/create",
          name: "attendance.create",
          component: { template: "<div />" },
        },
        {
          path: "/entries",
          name: "attendance.entries",
          component: { template: "<div />" },
        },
      ],
    });
    await router.push("/detail");
    const options = appMountOptions();
    options.global.plugins.push(router);
    const wrapper = mount(AttendanceNavigation, options);
    expect(wrapper.get("[aria-expanded]").attributes("aria-expanded")).toBe(
      "true",
    );
    expect(wrapper.get("[aria-current=page]").text()).toBe(t("entries"));
    await wrapper.get("[aria-expanded]").trigger("click");
    expect(wrapper.find("#attendance-navigation").exists()).toBe(false);
    await wrapper.get("[aria-expanded]").trigger("click");
    await wrapper
      .findAll("button")
      .find((b) => b.text() === t("ledger"))!
      .trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.name).toBe("attendance.ledger");
    expect(wrapper.emitted("navigate")).toHaveLength(1);
  });
});

describe("AttendanceDashboard lifecycle", () => {
  it("refreshes on entry, foreground, and company midnight, then stops on leave", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T16:59:50Z"));
    const backend = makeBackendFake();
    const service = new AttendanceService(
      backend.port,
      makeToast().service,
      display,
      forms,
      makeModal().service,
    );
    dependencies.service = service;
    dependencies.service!.resetSession("owner");
    const store = useAttendanceStore();
    store.state.today = "2026-11-17";
    const load = vi.spyOn(service, "loadDashboard").mockResolvedValue(true);
    const wrapper = mount(AttendanceDashboard, {
      ...appMountOptions(),
      props: { active: true },
    });
    expect(load).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    document.dispatchEvent(new window.Event("visibilitychange"));
    expect(load).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(load).toHaveBeenCalledTimes(3);
    await wrapper.setProps({ active: false });
    document.dispatchEvent(new window.Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(30_000);
    expect(load).toHaveBeenCalledTimes(3);
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
    Reflect.deleteProperty(document, "visibilityState");
  });
});
