<script setup lang="ts">
import { watch } from "vue";
import { IonPage, onIonViewDidEnter } from "@ionic/vue";
import { useRouter } from "vue-router";
import AttendanceEntryForm from "../components/AttendanceEntryForm.vue";
import { useAttendanceService } from "../AttendanceServiceContainer";
import { useAttendanceStore } from "../AttendanceStore";
import { AttendanceRouteName } from "../AttendanceRouter";
import { t } from "../locales";
const service = useAttendanceService(),
  store = useAttendanceStore(),
  router = useRouter();
function load() {
  void service.loadMissed();
}
onIonViewDidEnter(load);
watch(() => store.state.owner, load);
</script>
<template>
  <IonPage
    ><main
      class="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto p-4"
    >
      <h1 class="text-headline-medium">{{ t("create") }}</h1>
      <AttendanceEntryForm
        :key="store.state.epoch"
        @saved="router.push({ name: AttendanceRouteName.ENTRIES })"
      /></main
  ></IonPage>
</template>
