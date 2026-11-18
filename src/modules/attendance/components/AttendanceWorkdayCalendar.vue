<script setup lang="ts">
import { computed } from "vue";
import { HCard, HCardContent } from "@/libs/ui";
import {
  WorkdayExceptionTime,
  WorkdayExceptionType,
  type WorkdayException,
} from "../AttendanceEntities";
import type { WorkdayCalendarDayStatus } from "../AttendanceTypes";
import { useAttendancePresentationService } from "../AttendanceServiceContainer";
import { t } from "../locales";

const props = defineProps<{
  month: string;
  exceptions: WorkdayException[];
}>();
const display = useAttendancePresentationService();
const weekdays = display.workdayCalendarWeekdays();
const monthLabel = computed(() =>
  display.workdayCalendarMonthLabel(props.month),
);
const weeks = computed(() =>
  display.workdayCalendarWeeks(props.month, props.exceptions),
);

const dayClasses: Record<WorkdayCalendarDayStatus, string> = {
  past: "bg-surface-container-low text-on-surface-variant",
  today: "bg-primary-container text-on-primary-container",
  future: "bg-surface text-on-surface",
};

function statusLabel(status: WorkdayCalendarDayStatus): string {
  return status === "past"
    ? t("past")
    : status === "today"
      ? t("today")
      : t("future");
}

function typeLabel(exception: WorkdayException): string {
  return exception.type === WorkdayExceptionType.WORKDAY
    ? t("workday")
    : t("holiday");
}

function typeMark(exception: WorkdayException): string {
  return exception.type === WorkdayExceptionType.WORKDAY
    ? t("workdayCalendarWorkdayShort")
    : t("workdayCalendarHolidayShort");
}

function exceptionClasses(exception: WorkdayException): string {
  return exception.type === WorkdayExceptionType.WORKDAY
    ? "bg-success-container text-on-success-container"
    : "bg-tertiary-container text-on-tertiary-container";
}

function period(exception: WorkdayException): string {
  if (exception.time === WorkdayExceptionTime.FULL_DAY) return t("fullDay");
  return exception.time === WorkdayExceptionTime.MORNING
    ? t("morning")
    : t("afternoon");
}

function periodMark(exception: WorkdayException): string {
  if (exception.time === WorkdayExceptionTime.FULL_DAY)
    return t("workdayCalendarFullDayShort");
  return exception.time === WorkdayExceptionTime.MORNING
    ? t("workdayCalendarMorningShort")
    : t("workdayCalendarAfternoonShort");
}

function exceptionLabel(exception: WorkdayException): string {
  return `${typeLabel(exception)} · ${period(exception)} · ${exception.title}`;
}
</script>

<template>
  <HCard>
    <HCardContent class="flex flex-col gap-4 overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-title-large">{{ monthLabel }}</h2>
        <ul class="text-label-small flex flex-wrap gap-x-3 gap-y-2">
          <li class="flex items-center gap-1">
            <span
              aria-hidden="true"
              class="border-outline-variant bg-surface-container-low rounded-extra-small h-3 w-3 border"
            ></span
            >{{ t("past") }}
          </li>
          <li class="flex items-center gap-1">
            <span
              aria-hidden="true"
              class="bg-primary-container rounded-extra-small h-3 w-3"
            ></span
            >{{ t("today") }}
          </li>
          <li class="flex items-center gap-1">
            <span
              aria-hidden="true"
              class="border-outline-variant bg-surface rounded-extra-small h-3 w-3 border"
            ></span
            >{{ t("future") }}
          </li>
          <li class="flex items-center gap-1">
            <span
              aria-hidden="true"
              class="bg-tertiary-container rounded-extra-small h-3 w-3"
            ></span
            >{{ t("holiday") }}
          </li>
          <li class="flex items-center gap-1">
            <span
              aria-hidden="true"
              class="bg-success-container rounded-extra-small h-3 w-3"
            ></span
            >{{ t("workday") }}
          </li>
        </ul>
      </div>

      <div class="overflow-x-auto">
        <table
          class="w-full table-fixed border-collapse"
          :aria-label="monthLabel"
        >
          <thead>
            <tr>
              <th
                v-for="weekday in weekdays"
                :key="weekday.label"
                scope="col"
                class="border-outline-variant bg-surface-container-low text-label-medium border p-1 text-center sm:p-2"
              >
                <abbr class="no-underline" :title="weekday.label">{{
                  weekday.short
                }}</abbr>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(week, weekIndex) in weeks" :key="weekIndex">
              <td
                v-for="(day, dayIndex) in week"
                :key="day?.date ?? dayIndex"
                class="border-outline-variant border p-0.5 align-top sm:p-1"
              >
                <div
                  v-if="day"
                  class="rounded-extra-small flex min-h-16 flex-col gap-1 p-1 sm:min-h-24 sm:p-2"
                  :class="dayClasses[day.status]"
                >
                  <div>
                    <time
                      :datetime="day.date"
                      :aria-current="
                        day.status === 'today' ? 'date' : undefined
                      "
                      class="text-label-large"
                      >{{ day.day }}</time
                    >
                    <span class="sr-only"
                      >{{ day.date }} · {{ statusLabel(day.status) }}</span
                    >
                  </div>
                  <ul v-if="day.exceptions.length" class="flex flex-col gap-1">
                    <li
                      v-for="exception in day.exceptions"
                      :key="exception.id"
                      class="rounded-extra-small text-label-small px-1 py-0.5"
                      :class="exceptionClasses(exception)"
                    >
                      <span aria-hidden="true"
                        >{{ typeMark(exception) }} ·
                        {{ periodMark(exception) }}</span
                      >
                      <span
                        aria-hidden="true"
                        class="mt-0.5 hidden truncate md:block"
                        :title="exception.title"
                        >{{ exception.title }}</span
                      >
                      <span class="sr-only">{{
                        exceptionLabel(exception)
                      }}</span>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <section
        class="flex flex-col gap-3"
        :aria-label="`${t('workdayCalendarDetails')}: ${monthLabel}`"
      >
        <h3 class="text-title-medium">{{ t("workdayCalendarDetails") }}</h3>
        <p v-if="!exceptions.length">{{ t("workdayCalendarEmpty") }}</p>
        <ul v-else class="grid gap-2 lg:grid-cols-2">
          <li
            v-for="exception in exceptions"
            :key="exception.id"
            class="border-outline-variant rounded-small flex items-start justify-between gap-3 border p-3"
          >
            <div class="min-w-0">
              <time class="text-label-medium" :datetime="exception.date">{{
                exception.date
              }}</time>
              <h4 class="text-title-small break-words">
                {{ exception.title }}
              </h4>
              <p class="text-body-small">
                {{ typeLabel(exception) }} · {{ period(exception) }}
              </p>
            </div>
            <span
              aria-hidden="true"
              class="rounded-extra-small text-label-small px-2 py-1"
              :class="exceptionClasses(exception)"
              >{{ typeMark(exception) }} · {{ periodMark(exception) }}</span
            >
          </li>
        </ul>
      </section>
    </HCardContent>
  </HCard>
</template>
