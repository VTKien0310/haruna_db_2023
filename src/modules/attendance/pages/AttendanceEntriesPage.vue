<script setup lang="ts">
import {
  useAttendanceService,
  useAttendancePresentationService,
  useAttendanceFormService,
} from "../AttendanceServiceContainer";
import { reactive, ref, watch } from "vue";
import { IonPage, onIonViewDidEnter } from "@ionic/vue";
import { useRouter } from "vue-router";
import {
  HInput,
  HSelect,
  HButton,
  HCard,
  HCardContent,
  HProgressBar,
  HForm,
} from "@/libs/ui";
import { useAttendanceStore } from "../AttendanceStore";
import { ENTRY_TABLES } from "../AttendanceEntities";
import { type EntryFilters, PAGE_SIZE } from "../AttendanceTypes";
import { AttendanceRouteName } from "../AttendanceRouter";
import { t } from "../locales";
const display = useAttendancePresentationService();
const forms = useAttendanceFormService();
const service = useAttendanceService(),
  store = useAttendanceStore(),
  router = useRouter();
const defaults = (): EntryFilters => ({
  kind: "",
  from: "",
  to: "",
  exemption: "",
  title: "",
  ascending: false,
  page: 1,
});
const filters = reactive(defaults()),
  applied = ref(defaults()),
  order = ref("desc"),
  error = ref("");
function load() {
  void service.loadEntries({ ...applied.value });
}
function apply() {
  if (
    (filters.from && !forms.validDate(filters.from)) ||
    (filters.to && !forms.validDate(filters.to)) ||
    (filters.from && filters.to && filters.from > filters.to)
  ) {
    error.value = t("dateInvalid");
    return;
  }
  error.value = "";
  applied.value = { ...filters, ascending: order.value === "asc", page: 1 };
  load();
}
function page(offset: number) {
  applied.value.page += offset;
  load();
}
onIonViewDidEnter(load);
watch(
  () => store.state.owner,
  () => {
    Object.assign(filters, defaults());
    applied.value = defaults();
    load();
  },
);
</script>
<template>
  <IonPage
    ><main
      class="mx-auto flex h-full w-full max-w-5xl flex-col gap-4 overflow-y-auto p-4"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-headline-medium">{{ t("entries") }}</h1>
        <HButton @click="router.push({ name: AttendanceRouteName.CREATE })">{{
          t("create")
        }}</HButton>
      </div>
      <HForm
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        @submit.prevent="apply"
      >
        <HSelect
          v-model="filters.kind"
          :options="[
            { value: '', label: t('all') },
            ...ENTRY_TABLES.map((value) => ({ value, label: t(value) })),
          ]"
          text-by="label"
          value-by="value"
          :label="t('kind')"
        />
        <HSelect
          v-model="filters.exemption"
          :options="[
            { value: '', label: t('all') },
            { value: '0', label: t('normal') },
            { value: '1', label: t('exempt') },
          ]"
          text-by="label"
          value-by="value"
          :label="t('exemption')"
        />
        <HSelect
          v-model="order"
          :options="[
            { value: 'desc', label: t('newest') },
            { value: 'asc', label: t('oldest') },
          ]"
          text-by="label"
          value-by="value"
          :label="t('sort')"
        />
        <HInput v-model="filters.from" type="date" :label="t('from')" /><HInput
          v-model="filters.to"
          type="date"
          :label="t('to')"
        /><HInput v-model="filters.title" :label="t('search')" />
        <HButton type="submit">{{ t("apply") }}</HButton
        ><HButton
          variant="outlined"
          @click="
            Object.assign(filters, defaults());
            order = 'desc';
            apply();
          "
          >{{ t("clear") }}</HButton
        >
      </HForm>
      <p v-if="error" role="alert">{{ error }}</p>
      <HProgressBar v-if="store.state.listStatus === 'loading'" indeterminate />
      <div v-else-if="store.state.listStatus === 'error'" role="alert">
        <p>{{ t("loadFailed") }}</p>
        <HButton @click="load">{{ t("retry") }}</HButton>
      </div>
      <template v-else-if="store.state.listStatus === 'ready'">
        <p v-if="!store.state.entries.length">{{ t("noEntries") }}</p>
        <HCard v-for="entry in store.state.entries" :key="entry.id"
          ><HCardContent
            class="flex flex-wrap items-center justify-between gap-3"
            ><div class="min-w-0">
              <h2 class="text-title-medium break-words">{{ entry.title }}</h2>
              <p>{{ display.fact(entry) }}</p>
              <p class="text-body-small">
                {{ display.dateTime(entry.created_at) }} ·
                {{ entry.no_deduction ? t("exempt") : t("normal") }}
              </p>
            </div>
            <HButton
              variant="text"
              @click="
                router.push({
                  name: AttendanceRouteName.DETAIL,
                  params: { id: entry.id },
                })
              "
              >{{ t("details") }}</HButton
            ></HCardContent
          ></HCard
        >
        <nav
          class="flex items-center justify-between gap-2"
          :aria-label="t('page')"
        >
          <HButton
            variant="outlined"
            :disabled="applied.page <= 1"
            @click="page(-1)"
            >{{ t("previous") }}</HButton
          ><span>{{ t("page") }} {{ applied.page }}</span
          ><HButton
            variant="outlined"
            :disabled="applied.page * PAGE_SIZE >= store.state.count"
            @click="page(1)"
            >{{ t("next") }}</HButton
          >
        </nav>
      </template>
    </main></IonPage
  >
</template>
