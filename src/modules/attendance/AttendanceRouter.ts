import type { RouteRecordRaw } from "vue-router";
import { ensureWorkdayExceptionAccess } from "./AttendanceGuards";
export enum AttendanceRouteName {
  LEDGER = "attendance.ledger",
  CREATE = "attendance.create",
  ENTRIES = "attendance.entries",
  DETAIL = "attendance.detail",
  WORKDAY_CALENDAR = "attendance.workday-calendar",
  WORKDAY_EXCEPTIONS = "attendance.workday-exceptions",
  WORKDAY_EXCEPTION_CREATE = "attendance.workday-exception-create",
}
const routes: RouteRecordRaw[] = [
  {
    path: "/attendance/pto",
    name: AttendanceRouteName.LEDGER,
    component: () => import("./pages/AttendanceLedgerPage.vue"),
  },
  {
    path: "/attendance/create",
    name: AttendanceRouteName.CREATE,
    component: () => import("./pages/AttendanceCreatePage.vue"),
  },
  {
    path: "/attendance/entries",
    name: AttendanceRouteName.ENTRIES,
    component: () => import("./pages/AttendanceEntriesPage.vue"),
  },
  {
    path: "/attendance/entries/:id",
    name: AttendanceRouteName.DETAIL,
    component: () => import("./pages/AttendanceDetailPage.vue"),
  },
  {
    path: "/attendance/workday-calendar",
    name: AttendanceRouteName.WORKDAY_CALENDAR,
    component: () => import("./pages/AttendanceWorkdayCalendarPage.vue"),
  },
  {
    path: "/attendance/workday-exceptions",
    name: AttendanceRouteName.WORKDAY_EXCEPTIONS,
    component: () => import("./pages/AttendanceWorkdayExceptionsPage.vue"),
    beforeEnter: ensureWorkdayExceptionAccess,
  },
  {
    path: "/attendance/workday-exceptions/create",
    name: AttendanceRouteName.WORKDAY_EXCEPTION_CREATE,
    component: () => import("./pages/AttendanceWorkdayExceptionCreatePage.vue"),
    beforeEnter: ensureWorkdayExceptionAccess,
  },
];
export default routes;
