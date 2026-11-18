import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { nextTick } from "vue";
import AttendanceWorkdayExceptionsPage from "@/modules/attendance/pages/AttendanceWorkdayExceptionsPage.vue";
import AttendanceWorkdayExceptionCreatePage from "@/modules/attendance/pages/AttendanceWorkdayExceptionCreatePage.vue";
import AttendanceNavigation from "@/modules/attendance/components/AttendanceNavigation.vue";
import { AttendanceRouteName } from "@/modules/attendance/AttendanceRouter";
import { AttendanceFormService } from "@/modules/attendance/services/AttendanceFormService";
import { AttendancePresentationService } from "@/modules/attendance/services/AttendancePresentationService";
import { AttendanceService } from "@/modules/attendance/services/AttendanceService";
import { useAttendanceStore } from "@/modules/attendance/AttendanceStore";
import { WorkdayExceptionType } from "@/modules/attendance/AttendanceEntities";
import { useAuthStore } from "@/modules/auth/stores/AuthStore";
import { MasterRouteName } from "@/modules/master/MasterRouter";
import { AuthRouteName } from "@/modules/auth/AuthRouter";
import { BackendApiResult } from "@/ports/backend/BackendPortTypes";
import { t } from "@/modules/attendance/locales";
import { appMountOptions } from "../../support/mountApp";
import {
  makeBackendFake,
  queryError,
  queryResult,
} from "../../fakes/BackendFake";
import { makeModal, makeToast } from "../../fakes/Collaborators";
import { makeUserSpecialPermission } from "../../factories/Records";
import { exception } from "./AttendanceFixtures";

const display = new AttendancePresentationService();
const forms = new AttendanceFormService(display);
const dependencies = vi.hoisted(() => ({
  service: null as AttendanceService | null,
  access: vi.fn(),
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
vi.mock("@/modules/attendance/AttendanceGuards", () => ({
  ensureWorkdayExceptionAccess: dependencies.access,
}));
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

async function setup(path = "/workday-exceptions") {
  const backend = makeBackendFake();
  const toast = makeToast();
  const modal = makeModal();
  dependencies.service = new AttendanceService(
    backend.port,
    toast.service,
    display,
    forms,
    modal.service,
  );
  dependencies.service.resetSession("owner");
  const component = { template: "<div />" };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/workday-exceptions",
        name: AttendanceRouteName.WORKDAY_EXCEPTIONS,
        component,
      },
      {
        path: "/workday-exceptions/create",
        name: AttendanceRouteName.WORKDAY_EXCEPTION_CREATE,
        component,
      },
      {
        path: "/entries",
        name: AttendanceRouteName.ENTRIES,
        component,
      },
      { path: "/404", name: MasterRouteName.NOT_FOUND, component },
      { path: "/login", name: AuthRouteName.LOGIN, component },
    ],
  });
  await router.push(path);
  const options = appMountOptions();
  options.global.plugins.push(router);
  return { backend, modal, toast, router, options };
}

const past = exception({
  id: "past",
  date: "2026-11-16",
  title: "Past holiday",
});
const future = exception({
  id: "123e4567-e89b-42d3-a456-426614174000",
  date: "2026-11-18",
  title: "Future holiday",
});

describe("AttendanceWorkdayExceptionsPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T02:00:00Z"));
    dependencies.access.mockResolvedValue(true);
  });

  it("renders all rows and exposes deletion only for mutable dates", async () => {
    const { backend, options } = await setup();
    backend.query(queryResult([past, future]));
    const wrapper = mount(AttendanceWorkdayExceptionsPage, options);
    await flushPromises();
    expect(wrapper.text()).toContain("Past holiday");
    expect(wrapper.text()).toContain("Future holiday");
    expect(wrapper.text()).toContain(t("workdayExceptionImmutable"));
    expect(
      wrapper
        .findAll("button")
        .filter((button) => button.text() === t("workdayExceptionDelete")),
    ).toHaveLength(1);
  });

  it("confirms deletion, calls the API, and reloads the list", async () => {
    const { backend, modal, options } = await setup();
    modal.confirm.mockResolvedValue(true);
    backend.query(queryResult([past, future]));
    const wrapper = mount(AttendanceWorkdayExceptionsPage, options);
    await flushPromises();
    backend.delete.mockResolvedValue(BackendApiResult.ok(null));
    backend.query(queryResult([past]));
    await wrapper
      .findAll("button")
      .find((button) => button.text() === t("workdayExceptionDelete"))!
      .trigger("click");
    await flushPromises();
    expect(backend.delete).toHaveBeenCalledWith(
      `attendance/workday-exceptions/${future.id}`,
    );
    expect(wrapper.text()).not.toContain("Future holiday");
    expect(wrapper.text()).toContain("Past holiday");
  });

  it("shows read failures and retries into an empty state", async () => {
    const { backend, options } = await setup();
    backend.query(queryError());
    const wrapper = mount(AttendanceWorkdayExceptionsPage, options);
    await flushPromises();
    expect(wrapper.get("[role=alert]").text()).toContain(
      t("workdayExceptionsLoadFailed"),
    );
    backend.query(queryResult([]));
    await wrapper
      .findAll("button")
      .find((button) => button.text() === t("retry"))!
      .trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain(t("workdayExceptionsEmpty"));
  });

  it("redirects denied access without reading management data", async () => {
    dependencies.access.mockResolvedValue({ name: MasterRouteName.NOT_FOUND });
    const { backend, router, options } = await setup();
    mount(AttendanceWorkdayExceptionsPage, options);
    await flushPromises();
    expect(router.currentRoute.value.name).toBe(MasterRouteName.NOT_FOUND);
    expect(backend.spbClient.from).not.toHaveBeenCalled();
  });

  it("rechecks access and clears rows when the account changes", async () => {
    const { backend, router, options } = await setup();
    backend.query(queryResult([future]));
    const wrapper = mount(AttendanceWorkdayExceptionsPage, options);
    await flushPromises();
    expect(wrapper.text()).toContain("Future holiday");
    dependencies.access.mockResolvedValue({ name: MasterRouteName.NOT_FOUND });
    dependencies.service!.resetSession("next-owner");
    await flushPromises();
    expect(router.currentRoute.value.name).toBe(MasterRouteName.NOT_FOUND);
    expect(useAttendanceStore().state.workdayExceptions).toEqual([]);
    expect(backend.spbClient.from).toHaveBeenCalledTimes(1);
  });
});

describe("AttendanceWorkdayExceptionCreatePage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T02:00:00Z"));
    dependencies.access.mockResolvedValue(true);
  });

  it("preserves input after failure and navigates after confirmed creation", async () => {
    const { backend, modal, router, options } = await setup(
      "/workday-exceptions/create",
    );
    modal.confirm.mockResolvedValue(true);
    backend.post.mockResolvedValueOnce(
      BackendApiResult.err(new Error("offline")),
    );
    const wrapper = mount(AttendanceWorkdayExceptionCreatePage, options);
    await flushPromises();
    await wrapper.get('input[aria-label="Title"]').setValue("Company holiday");
    await wrapper.get('input[aria-label="Work date"]').setValue("2026-11-18");
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(
      (wrapper.get('input[aria-label="Title"]').element as HTMLInputElement)
        .value,
    ).toBe("Company holiday");
    expect(router.currentRoute.value.name).toBe(
      AttendanceRouteName.WORKDAY_EXCEPTION_CREATE,
    );

    backend.post.mockResolvedValueOnce(BackendApiResult.ok(future));
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(backend.post).toHaveBeenLastCalledWith(
      "attendance/workday-exceptions",
      {
        type: WorkdayExceptionType.HOLIDAY,
        date: "2026-11-18",
        time: 0,
        title: "Company holiday",
      },
    );
    expect(router.currentRoute.value.name).toBe(
      AttendanceRouteName.WORKDAY_EXCEPTIONS,
    );
  });

  it("validates weekday rules before confirmation or API access", async () => {
    const { backend, modal, options } = await setup(
      "/workday-exceptions/create",
    );
    const wrapper = mount(AttendanceWorkdayExceptionCreatePage, options);
    await flushPromises();
    await wrapper.get('input[aria-label="Title"]').setValue("Invalid holiday");
    await wrapper.get('input[aria-label="Work date"]').setValue("2026-11-21");
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(wrapper.get("[role=alert]").text()).toBe(
      t("workdayExceptionDayInvalid"),
    );
    expect(modal.confirm).not.toHaveBeenCalled();
    expect(backend.post).not.toHaveBeenCalled();
  });
});

describe("AttendanceNavigation workday exceptions", () => {
  it("hides management until the permission is present", async () => {
    const { router, options } = await setup("/entries");
    const wrapper = mount(AttendanceNavigation, options);
    expect(wrapper.text()).not.toContain(t("workdayExceptions"));
    useAuthStore().userSpecialPermissions = [makeUserSpecialPermission()];
    await nextTick();
    const link = wrapper
      .findAll("button")
      .find((button) => button.text() === t("workdayExceptions"))!;
    await link.trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.name).toBe(
      AttendanceRouteName.WORKDAY_EXCEPTIONS,
    );
    await router.push("/workday-exceptions/create");
    await nextTick();
    expect(link.attributes("aria-current")).toBe("page");
  });
});
