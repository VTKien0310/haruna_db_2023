<script setup lang="ts">
import { watch } from "vue";
import { IonPage, onIonViewDidEnter } from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import { HButton, HCard, HCardContent, HProgressBar } from "@/libs/ui";
import {
  useAttendanceFormService,
  useAttendanceService,
} from "../AttendanceServiceContainer";
import { ensureWorkdayExceptionAccess } from "../AttendanceGuards";
import { AttendanceRouteName } from "../AttendanceRouter";
import {
  WorkdayExceptionTime,
  WorkdayExceptionType,
  type WorkdayException,
} from "../AttendanceEntities";
import { useAttendanceStore } from "../AttendanceStore";
import { t } from "../locales";

const forms = useAttendanceFormService();
const service = useAttendanceService();
const store = useAttendanceStore();
const route = useRoute();
const router = useRouter();

async function load(): Promise<void> {
  const epoch = store.state.epoch;
  const outcome = await ensureWorkdayExceptionAccess();
  if (
    epoch !== store.state.epoch ||
    route.name !== AttendanceRouteName.WORKDAY_EXCEPTIONS
  )
    return;
  if (outcome !== true) {
    await router.replace(outcome);
    return;
  }
  await service.loadWorkdayExceptions();
}

async function remove(exception: WorkdayException): Promise<void> {
  if (await service.deleteWorkdayException(exception)) await load();
}

function period(exception: WorkdayException): string {
  if (exception.time === WorkdayExceptionTime.FULL_DAY) return t("fullDay");
  return exception.time === WorkdayExceptionTime.MORNING
    ? t("morning")
    : t("afternoon");
}

onIonViewDidEnter(() => void load());
watch(
  () => store.state.owner,
  () => void load(),
);
</script>

<template>
  <IonPage>
    <main
      class="mx-auto flex h-full w-full max-w-5xl flex-col gap-4 overflow-y-auto p-4"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-headline-medium">{{ t("workdayExceptions") }}</h1>
        <HButton
          :disabled="store.state.saving"
          @click="
            router.push({
              name: AttendanceRouteName.WORKDAY_EXCEPTION_CREATE,
            })
          "
          >{{ t("createWorkdayException") }}</HButton
        >
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
      <template v-else-if="store.state.workdayExceptionsStatus === 'ready'">
        <p v-if="!store.state.workdayExceptions.length">
          {{ t("workdayExceptionsEmpty") }}
        </p>
        <HCard
          v-for="exception in store.state.workdayExceptions"
          :key="exception.id"
        >
          <HCardContent
            class="flex flex-wrap items-center justify-between gap-3"
          >
            <div class="min-w-0">
              <h2 class="text-title-medium break-words">
                {{ exception.title }}
              </h2>
              <p>{{ exception.date }}</p>
              <p class="text-body-small">
                {{
                  exception.type === WorkdayExceptionType.WORKDAY
                    ? t("workday")
                    : t("holiday")
                }}
                · {{ period(exception) }}
              </p>
              <p
                v-if="!forms.workdayExceptionMutable(exception.date)"
                class="text-body-small text-on-surface-variant"
              >
                {{ t("workdayExceptionImmutable") }}
              </p>
            </div>
            <HButton
              v-if="forms.workdayExceptionMutable(exception.date)"
              variant="text"
              color="error"
              :disabled="store.state.saving"
              :loading="store.state.deletingWorkdayException === exception.id"
              @click="remove(exception)"
              >{{ t("workdayExceptionDelete") }}</HButton
            >
          </HCardContent>
        </HCard>
      </template>
    </main>
  </IonPage>
</template>
