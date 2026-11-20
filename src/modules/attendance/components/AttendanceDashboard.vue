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
  HIcon,
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
const isNotCheckedIn = computed(
  () => store.state.dashboardStatus === "ready" && status.value.enabled,
);
const isLoadError = computed(() => store.state.dashboardStatus === "error");
const isAlert = computed(() => isNotCheckedIn.value || isLoadError.value);
const statusLabel = computed(() =>
  store.state.dashboardStatus === "ready"
    ? status.value.label
    : isLoadError.value
      ? t("loadFailed")
      : t("loading"),
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
  <section
    class="mb-2 grid w-full grid-cols-1 gap-2 md:grid-cols-3"
    :aria-label="t('attendance')"
  >
    <HCard
      class="flex h-full w-full flex-col"
      :class="
        store.state.dashboardStatus === 'ready'
          ? 'md:col-span-1'
          : 'md:col-span-3'
      "
    >
      <HCardTitle class="text-center md:text-left">
        {{ t("today") }} · {{ display.now().format("YYYY-MM-DD") }}
      </HCardTitle>
      <HCardContent
        class="flex flex-1 flex-col items-center justify-between gap-3 text-center md:items-start md:text-left"
      >
        <HProgressBar
          v-if="store.state.dashboardStatus === 'loading'"
          indeterminate
          class="w-full"
        />
        <p
          :role="isAlert ? 'alert' : 'status'"
          class="w-full"
          :class="
            isAlert
              ? 'bg-error-container text-on-error-container rounded-small flex items-center justify-center gap-2 px-3 py-2 font-medium md:justify-start'
              : ''
          "
        >
          <HIcon
            v-if="isAlert"
            :name="isLoadError ? 'error' : 'warning'"
            size="1.25rem"
            aria-hidden="true"
          />
          <span>{{ statusLabel }}</span>
        </p>
        <div class="flex w-full flex-col gap-2">
          <HButton
            class="w-full"
            :disabled="
              store.state.dashboardStatus !== 'ready' ||
              !status.enabled ||
              store.state.saving
            "
            @click="service.quickCheckIn()"
            >{{ store.state.saving ? t("saving") : t("checkIn") }}</HButton
          >
          <HButton
            v-if="isLoadError"
            class="w-full"
            variant="outlined"
            @click="refresh"
            >{{ t("retry") }}</HButton
          >
        </div>
      </HCardContent>
    </HCard>
    <AttendanceBankSummary
      v-if="store.state.dashboardStatus === 'ready'"
      class="h-full w-full md:col-span-2"
      :bank="store.state.bank"
      center-on-mobile
    />
  </section>
</template>
