import type { AttendanceEntry, LoadStatus } from "./AttendanceTypes";
import { defineStore } from "pinia";
import { ref } from "vue";
import {
  type PtoBank,
  type PtoTransaction,
  type Row,
} from "./AttendanceEntities";
export const useAttendanceStore = defineStore("attendance", () => {
  const state = ref({
    owner: "",
    epoch: 0,
    revision: 0,
    saving: false,
    requests: { dashboard: 0, ledger: 0, list: 0, detail: 0, missed: 0 },
    today: "",
    todayEntries: [] as AttendanceEntry[],
    exceptions: [] as Row<"workday_exceptions">[],
    workStart: "",
    bank: null as PtoBank | null,
    dashboardStatus: "idle" as LoadStatus,
    banks: [] as PtoBank[],
    year: "",
    transactions: [] as PtoTransaction[],
    ledgerStatus: "idle" as LoadStatus,
    entries: [] as AttendanceEntry[],
    count: 0,
    listStatus: "idle" as LoadStatus,
    detail: null as AttendanceEntry | null,
    detailTransactions: [] as PtoTransaction[],
    detailStatus: "idle" as LoadStatus,
    missed: [] as string[],
    missedStatus: "idle" as LoadStatus,
  });
  return { state };
});
