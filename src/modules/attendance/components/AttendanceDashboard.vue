<script setup lang="ts">
import {
  useAttendanceService,
  useAttendancePresentationService,
} from "../AttendanceServiceContainer";
import { computed, onUnmounted, watch } from "vue";

import {
  HButton,
  HCard,
  HCardTitle,
  HCardContent,
  HProgressBar,
} from "@/libs/ui";
import { useAttendanceStore } from "../AttendanceStore";
import AttendanceBankSummary from "./AttendanceBankSummary.vue";
import { t } from "../locales";
const display = useAttendancePresentationService();
const props = defineProps<{ active: boolean }>();
const store = useAttendanceStore();
const service = useAttendanceService();
const status = computed(() =>
  display.status(
    store.state.today,
    store.state.workStart,
    store.state.exceptions,
    store.state.todayEntries,
  ),
);
let active = false;
let timer: ReturnType<typeof setInterval> | undefined;
function refresh() {
  if (
    active &&
    store.state.owner &&
    !store.state.saving &&
    store.state.dashboardStatus !== "loading"
  )
    void service.loadDashboard();
}
function visible() {
  if (document.visibilityState === "visible") refresh();
}
function stop() {
  active = false;
  clearInterval(timer);
  document.removeEventListener("visibilitychange", visible);
}
function start() {
  stop();
  active = true;
  refresh();
  document.addEventListener("visibilitychange", visible);
  timer = setInterval(() => {
    if (store.state.today !== display.now().format("YYYY-MM-DD")) refresh();
  }, 30_000);
}
watch(
  () => props.active,
  (value) => {
    if (value) start();
    else stop();
  },
  { immediate: true },
);
onUnmounted(stop);
watch(() => store.state.owner, refresh);
</script>
<template>
  <section class="mb-4 flex flex-col gap-3" :aria-label="t('attendance')">
    <HCard
      ><HCardTitle
        >{{ t("today") }} · {{ display.now().format("YYYY-MM-DD") }}</HCardTitle
      ><HCardContent class="flex flex-col items-start gap-3">
        <HProgressBar
          v-if="store.state.dashboardStatus === 'loading'"
          indeterminate
          class="w-full"
        />
        <p role="status">
          {{
            store.state.dashboardStatus === "ready"
              ? status.label
              : store.state.dashboardStatus === "error"
                ? t("loadFailed")
                : t("loading")
          }}
        </p>
        <HButton
          :disabled="
            store.state.dashboardStatus !== 'ready' ||
            !status.enabled ||
            store.state.saving
          "
          @click="service.quickCheckIn()"
          >{{ store.state.saving ? t("saving") : t("checkIn") }}</HButton
        >
        <HButton
          v-if="store.state.dashboardStatus === 'error'"
          variant="outlined"
          @click="refresh"
          >{{ t("retry") }}</HButton
        >
      </HCardContent></HCard
    >
    <AttendanceBankSummary
      v-if="store.state.dashboardStatus === 'ready'"
      :bank="store.state.bank"
    />
  </section>
</template>
