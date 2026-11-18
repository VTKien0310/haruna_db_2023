<script setup lang="ts">
import { watch } from "vue";
import { IonPage, onIonViewDidEnter } from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import { HButton } from "@/libs/ui";
import AttendanceWorkdayExceptionForm from "../components/AttendanceWorkdayExceptionForm.vue";
import { ensureWorkdayExceptionAccess } from "../AttendanceGuards";
import { AttendanceRouteName } from "../AttendanceRouter";
import { useAttendanceStore } from "../AttendanceStore";
import { t } from "../locales";

const store = useAttendanceStore();
const route = useRoute();
const router = useRouter();

async function verifyAccess(): Promise<void> {
  const epoch = store.state.epoch;
  const outcome = await ensureWorkdayExceptionAccess();
  if (
    epoch !== store.state.epoch ||
    route.name !== AttendanceRouteName.WORKDAY_EXCEPTION_CREATE
  )
    return;
  if (outcome !== true) await router.replace(outcome);
}

onIonViewDidEnter(() => void verifyAccess());
watch(
  () => store.state.owner,
  () => void verifyAccess(),
);
</script>

<template>
  <IonPage>
    <main
      class="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto p-4"
    >
      <HButton
        variant="text"
        class="self-start"
        @click="router.push({ name: AttendanceRouteName.WORKDAY_EXCEPTIONS })"
        >{{ t("backToWorkdayExceptions") }}</HButton
      >
      <h1 class="text-headline-medium">{{ t("createWorkdayException") }}</h1>
      <AttendanceWorkdayExceptionForm
        :key="store.state.epoch"
        @saved="router.push({ name: AttendanceRouteName.WORKDAY_EXCEPTIONS })"
        @cancel="router.push({ name: AttendanceRouteName.WORKDAY_EXCEPTIONS })"
      />
    </main>
  </IonPage>
</template>
