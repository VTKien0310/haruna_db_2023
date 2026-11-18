<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { IonPage, onIonViewDidEnter } from "@ionic/vue";
import { HButton, HProgressBar, HSelect } from "@/libs/ui";
import AttendanceWorkdayCalendar from "../components/AttendanceWorkdayCalendar.vue";
import {
  useAttendancePresentationService,
  useAttendanceService,
} from "../AttendanceServiceContainer";
import { useAttendanceStore } from "../AttendanceStore";
import { WORKDAY_CALENDAR_MIN_YEAR } from "../AttendanceTypes";
import { t } from "../locales";

const display = useAttendancePresentationService();
const service = useAttendanceService();
const store = useAttendanceStore();
const selectedMonth = ref(display.now().format("YYYY-MM"));
const minMonth = `${WORKDAY_CALENDAR_MIN_YEAR}-01`;
const maxMonth = `${display.now().year()}-12`;
const months = display.workdayCalendarMonths();
const years = display
  .workdayCalendarYears()
  .map((value) => ({ value, label: value }));
const monthExceptions = computed(() =>
  store.state.workdayExceptions.filter((exception) =>
    exception.date.startsWith(`${selectedMonth.value}-`),
  ),
);
const canGoBack = computed(() => selectedMonth.value > minMonth);
const canGoForward = computed(() => selectedMonth.value < maxMonth);

function load(): void {
  void service.loadWorkdayExceptions();
}

function selectMonth(month: string): void {
  selectedMonth.value = `${selectedMonth.value.slice(0, 4)}-${month}`;
}

function selectYear(year: string): void {
  selectedMonth.value = `${year}-${selectedMonth.value.slice(5, 7)}`;
}

function moveMonth(amount: number): void {
  const month = display.shiftWorkdayCalendarMonth(selectedMonth.value, amount);
  if (month >= minMonth && month <= maxMonth) selectedMonth.value = month;
}

function showCurrentMonth(): void {
  selectedMonth.value = display.now().format("YYYY-MM");
}

onIonViewDidEnter(load);
watch(() => store.state.owner, load);
</script>

<template>
  <IonPage>
    <main
      class="mx-auto flex h-full w-full max-w-7xl flex-col gap-4 overflow-y-auto p-4"
    >
      <h1 class="text-headline-medium">{{ t("workdayCalendar") }}</h1>
      <div class="grid gap-3 sm:grid-cols-2">
        <HSelect
          :model-value="selectedMonth.slice(5, 7)"
          :options="months"
          value-by="value"
          text-by="label"
          :label="t('month')"
          @update:model-value="selectMonth"
        />
        <HSelect
          :model-value="selectedMonth.slice(0, 4)"
          :options="years"
          value-by="value"
          text-by="label"
          :label="t('year')"
          @update:model-value="selectYear"
        />
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <HButton
          icon="chevron_left"
          variant="outlined"
          :aria-label="t('previousMonth')"
          :disabled="!canGoBack"
          @click="moveMonth(-1)"
        />
        <HButton variant="text" @click="showCurrentMonth">{{
          t("today")
        }}</HButton>
        <HButton
          icon="chevron_right"
          variant="outlined"
          :aria-label="t('nextMonth')"
          :disabled="!canGoForward"
          @click="moveMonth(1)"
        />
      </div>
      <HProgressBar
        v-if="['idle', 'loading'].includes(store.state.workdayExceptionsStatus)"
        indeterminate
      />
      <div
        v-else-if="store.state.workdayExceptionsStatus === 'error'"
        role="alert"
        class="flex flex-col items-start gap-3"
      >
        <p>{{ t("workdayExceptionsLoadFailed") }}</p>
        <HButton @click="load">{{ t("retry") }}</HButton>
      </div>
      <AttendanceWorkdayCalendar
        v-else-if="store.state.workdayExceptionsStatus === 'ready'"
        :month="selectedMonth"
        :exceptions="monthExceptions"
      />
    </main>
  </IonPage>
</template>
