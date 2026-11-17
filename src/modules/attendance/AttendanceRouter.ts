import type { RouteRecordRaw } from "vue-router";
export enum AttendanceRouteName {
  LEDGER = "attendance.ledger",
  CREATE = "attendance.create",
  ENTRIES = "attendance.entries",
  DETAIL = "attendance.detail",
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
];
export default routes;
