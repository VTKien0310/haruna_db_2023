import { AttendanceFormService } from "@/modules/attendance/services/AttendanceFormService";
import { AttendancePresentationService } from "@/modules/attendance/services/AttendancePresentationService";
import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import AttendanceLedgerPage from "@/modules/attendance/pages/AttendanceLedgerPage.vue";
import AttendanceEntriesPage from "@/modules/attendance/pages/AttendanceEntriesPage.vue";
import AttendanceDetailPage from "@/modules/attendance/pages/AttendanceDetailPage.vue";
import { AttendanceService } from "@/modules/attendance/services/AttendanceService";
import { appMountOptions } from "../../support/mountApp";
import {
  makeBackendFake,
  queryResult,
  queryError,
} from "../../fakes/BackendFake";
import { makeToast } from "../../fakes/Collaborators";
import { bank, entry, transaction } from "./AttendanceFixtures";
import { t } from "@/modules/attendance/locales";
const display = new AttendancePresentationService();
const forms = new AttendanceFormService(display);
const deps = vi.hoisted(() => ({ service: null as AttendanceService | null }));
vi.mock("@/modules/attendance/AttendanceServiceContainer", async () => {
  const { AttendancePresentationService } =
    await import("@/modules/attendance/services/AttendancePresentationService");
  const { AttendanceFormService } =
    await import("@/modules/attendance/services/AttendanceFormService");
  return {
    useAttendancePresentationService: () => new AttendancePresentationService(),
    useAttendanceFormService: () =>
      new AttendanceFormService(new AttendancePresentationService()),
    useAttendanceService: () => deps.service,
  };
});
vi.mock("@ionic/vue", async () => {
  const vue = await import("vue");
  return {
    IonPage: vue.defineComponent({
      setup:
        (_, { slots }) =>
        () =>
          vue.h("div", slots.default?.()),
    }),
    onIonViewDidEnter: vue.onMounted,
    onIonViewWillLeave: vue.onBeforeUnmount,
  };
});
async function setup(path: string) {
  const backend = makeBackendFake();
  deps.service = new AttendanceService(
    backend.port,
    makeToast().service,
    display,
    forms,
  );
  deps.service.resetSession("owner");
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/ledger",
        name: "attendance.ledger",
        component: { template: "<div />" },
      },
      {
        path: "/entries",
        name: "attendance.entries",
        component: { template: "<div />" },
      },
      {
        path: "/detail/:id",
        name: "attendance.detail",
        component: { template: "<div />" },
      },
      {
        path: "/create",
        name: "attendance.create",
        component: { template: "<div />" },
      },
    ],
  });
  await router.push(path);
  const options = appMountOptions();
  options.global.plugins.push(router);
  return { backend, router, options };
}
describe("AttendancePages", () => {
  it("renders bank and complete monthly summaries with a detail link", async () => {
    const { backend, options, router } = await setup("/ledger");
    backend.query(queryResult([bank()]));
    backend.query(
      queryResult([
        transaction(),
        transaction({
          id: "refund",
          value: 30,
          exceed_bank_value: 20,
          type: 1,
        }),
      ]),
    );
    const wrapper = mount(AttendanceLedgerPage, options);
    expect(wrapper.text()).not.toContain("2026-11");
    await flushPromises();
    expect(wrapper.text()).toContain("2026-11");
    expect(wrapper.text()).toContain("Net change");
    expect(wrapper.text()).toContain("−0d 0h 50m");
    await wrapper
      .findAll("button")
      .find((b) => b.text() === t("details"))!
      .trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.name).toBe("attendance.detail");
  });
  it.each([
    { name: "negative", deducted: 60, restored: 10, excess: 40, cancelled: 20 },
    { name: "positive", deducted: 10, restored: 60, excess: 0, cancelled: 0 },
    { name: "zero", deducted: 0, restored: 0, excess: 0, cancelled: 0 },
  ])(
    "colors the $name monthly summary without emphasizing ordinary deductions",
    async ({ deducted, restored, excess, cancelled }) => {
      const { backend, options } = await setup("/ledger");
      backend.query(queryResult([bank()]));
      backend.query(
        queryResult([
          transaction({
            id: "deduction",
            type: 0,
            value: deducted + excess,
            exceed_bank_value: excess,
          }),
          transaction({
            id: "refund",
            type: 1,
            value: restored + cancelled,
            exceed_bank_value: cancelled,
          }),
        ]),
      );
      const wrapper = mount(AttendanceLedgerPage, options);
      await flushPromises();
      const summary = wrapper.get("dl.grid-cols-2");
      const expectations = [
        ["deducted", false, false],
        ["restored", restored > 0, false],
        ["net", restored > deducted, false],
        ["excess", false, excess > 0],
        ["cancelled", cancelled > 0, false],
      ] as const;
      for (const [label, green, red] of expectations) {
        const term = summary
          .findAll("dt")
          .find((node) => node.text() === t(label))!;
        const group = term.element.parentElement!;
        expect(group.classList.contains("text-success")).toBe(green);
        expect(group.classList.contains("text-error")).toBe(red);
        expect(group.querySelector("dd")).not.toBeNull();
      }
    },
  );
  it("shows ledger failure and supports retry into an empty state", async () => {
    const { backend, options } = await setup("/ledger");
    backend.query(queryError());
    const wrapper = mount(AttendanceLedgerPage, options);
    await flushPromises();
    expect(wrapper.text()).toContain(t("loadFailed"));
    backend.query(queryResult([]));
    await wrapper
      .findAll("button")
      .find((b) => b.text() === t("retry"))!
      .trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain(t("noBanks"));
  });
  it("applies list search and paginates with real filter controls", async () => {
    const { backend, options } = await setup("/entries");
    backend.query(queryResult([entry()], 51));
    backend.query(queryResult([entry().fact]));
    const wrapper = mount(AttendanceEntriesPage, options);
    await flushPromises();
    expect(wrapper.text()).toContain("Check-in");
    const nextQuery = backend.query(queryResult([], 51));
    await wrapper
      .findAll("button")
      .find((b) => b.text() === t("next"))!
      .trigger("click");
    await flushPromises();
    expect(nextQuery.range).toHaveBeenCalledWith(50, 99);
    expect(wrapper.text()).toContain(t("noEntries"));
    const searchQuery = backend.query(queryResult([], 0));
    await wrapper.get("input[type=text]").setValue("Vacation");
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(searchQuery.ilike).toHaveBeenCalledWith("title", "%Vacation%");
    expect(searchQuery.range).toHaveBeenCalledWith(0, 49);
  });
  it("shows system entry facts without an edit action", async () => {
    const { backend, options } = await setup("/detail/system");
    backend.query(
      queryResult([entry({ entry_type: "miss_check_in_entries" })]),
    );
    backend.query(
      queryResult([{ id: "fact", date: "2026-11-16", penalty: 480 }]),
    );
    backend.query(queryResult([]));
    const wrapper = mount(AttendanceDetailPage, options);
    await flushPromises();
    expect(wrapper.text()).toContain("1d 0h 0m");
    expect(wrapper.text()).toContain(t("readOnlyHint"));
    expect(wrapper.findAll("button").some((b) => b.text() === t("edit"))).toBe(
      false,
    );
  });
});
