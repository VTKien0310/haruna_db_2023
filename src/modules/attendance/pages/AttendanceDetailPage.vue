<script setup lang="ts">
import {
  useAttendanceService,
  useAttendancePresentationService,
  useAttendanceFormService,
} from "../AttendanceServiceContainer";
import { ref, watch } from "vue";
import { IonPage, onIonViewDidEnter, onIonViewWillLeave } from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import { HButton, HCard, HCardContent, HProgressBar } from "@/libs/ui";
import { useAttendanceStore } from "../AttendanceStore";
import { AttendanceRouteName } from "../AttendanceRouter";
import AttendanceEntryForm from "../components/AttendanceEntryForm.vue";
import AttendanceTransactions from "../components/AttendanceTransactions.vue";
import { t } from "../locales";
const display = useAttendancePresentationService();
const forms = useAttendanceFormService();
const service = useAttendanceService(),
  store = useAttendanceStore(),
  route = useRoute(),
  router = useRouter(),
  editing = ref(false);
function load() {
  if (route.name === AttendanceRouteName.DETAIL) {
    editing.value = false;
    void service.loadDetail(String(route.params.id));
  }
}
onIonViewDidEnter(load);
onIonViewWillLeave(() => {
  editing.value = false;
});
watch(() => [route.params.id, store.state.owner], load);
</script>
<template>
  <IonPage
    ><main
      class="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto p-4"
    >
      <HButton
        variant="text"
        @click="router.push({ name: AttendanceRouteName.ENTRIES })"
        >{{ t("back") }}</HButton
      >
      <h1 class="text-headline-medium">{{ t("detail") }}</h1>
      <HProgressBar
        v-if="store.state.detailStatus === 'loading'"
        indeterminate
      />
      <div v-else-if="store.state.detailStatus === 'error'" role="alert">
        <p>{{ t("loadFailed") }}</p>
        <HButton @click="load">{{ t("retry") }}</HButton>
      </div>
      <template v-else-if="store.state.detailStatus === 'ready'">
        <p v-if="!store.state.detail">{{ t("notFound") }}</p>
        <template v-else>
          <AttendanceEntryForm
            v-if="editing"
            :key="store.state.detail.id"
            :entry="store.state.detail"
            @saved="load"
            @cancel="editing = false"
          />
          <HCard v-else
            ><HCardContent class="flex flex-col gap-3"
              ><h2 class="text-title-large break-words">
                {{ store.state.detail.title }}
              </h2>
              <p>{{ display.fact(store.state.detail) }}</p>
              <p>
                {{
                  store.state.detail.no_deduction ? t("exempt") : t("normal")
                }}
              </p>
              <p class="break-words whitespace-pre-wrap">
                {{ store.state.detail.note || t("emptyNote") }}
              </p>
              <p>
                {{ t("created") }}:
                {{ display.dateTime(store.state.detail.created_at) }}
              </p>
              <HButton
                v-if="forms.editable(store.state.detail)"
                @click="editing = true"
                >{{ t("edit") }}</HButton
              >
              <p v-else>{{ t("readOnlyHint") }}</p></HCardContent
            ></HCard
          >
          <h2 class="text-title-large">{{ t("transactions") }}</h2>
          <AttendanceTransactions :rows="store.state.detailTransactions" />
        </template>
      </template></main
  ></IonPage>
</template>
