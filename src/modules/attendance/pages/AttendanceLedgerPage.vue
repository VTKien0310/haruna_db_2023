<script setup lang="ts">
import {
  useAttendanceService,
  useAttendancePresentationService,
} from "../AttendanceServiceContainer";
import { computed, ref, watch } from "vue";
import { IonPage, onIonViewDidEnter } from "@ionic/vue";
import {
  HButton,
  HSelect,
  HCard,
  HCardContent,
  HCardTitle,
  HProgressBar,
} from "@/libs/ui";
import { useAttendanceStore } from "../AttendanceStore";
import AttendanceBankSummary from "../components/AttendanceBankSummary.vue";
import AttendanceTransactions from "../components/AttendanceTransactions.vue";
import { t } from "../locales";
const display = useAttendancePresentationService();
const store = useAttendanceStore(),
  service = useAttendanceService();
const order = ref("desc");
const groups = computed(() =>
  display.groups(store.state.transactions, order.value === "asc"),
);
const bank = computed(
  () =>
    store.state.banks.find((b) => String(b.year) === store.state.year) ?? null,
);
function load() {
  void service.loadLedger();
}
onIonViewDidEnter(load);
watch(() => store.state.owner, load);
</script>
<template>
  <IonPage
    ><main
      class="mx-auto flex h-full w-full max-w-5xl flex-col gap-4 overflow-y-auto p-4"
    >
      <h1 class="text-headline-medium">{{ t("ledger") }}</h1>
      <HProgressBar
        v-if="store.state.ledgerStatus === 'loading'"
        indeterminate
      />
      <div v-else-if="store.state.ledgerStatus === 'error'" role="alert">
        <p>{{ t("loadFailed") }}</p>
        <HButton @click="load">{{ t("retry") }}</HButton>
      </div>
      <template v-else-if="store.state.ledgerStatus === 'ready'">
        <p v-if="!store.state.banks.length">{{ t("noBanks") }}</p>
        <template v-else>
          <div class="grid gap-3 sm:grid-cols-2">
            <HSelect
              :model-value="store.state.year"
              @update:model-value="service.loadLedger($event)"
              :options="
                store.state.banks.map((b) => ({
                  value: String(b.year),
                  label: String(b.year),
                }))
              "
              value-by="value"
              text-by="label"
              :label="t('year')"
            /><HSelect
              v-model="order"
              :options="[
                { value: 'desc', label: t('newest') },
                { value: 'asc', label: t('oldest') },
              ]"
              value-by="value"
              text-by="label"
              :label="t('sort')"
            />
          </div>
          <AttendanceBankSummary :bank="bank" originals />
          <p v-if="!groups.length">{{ t("noTransactions") }}</p>
          <HCard v-for="group in groups" :key="group.month"
            ><HCardTitle>{{ group.month }}</HCardTitle
            ><HCardContent>
              <dl class="grid grid-cols-2 gap-3 md:grid-cols-3">
                <div
                  v-for="item in [
                    ['deducted', group.deducted],
                    ['restored', group.restored],
                    ['net', group.restored - group.deducted],
                    ['excess', group.excess],
                    ['cancelled', group.cancelled],
                  ] as const"
                  :key="item[0]"
                  :class="{
                    'text-success':
                      item[1] > 0 &&
                      ['restored', 'net', 'cancelled'].includes(item[0]),
                    'text-error': item[1] > 0 && item[0] === 'excess',
                  }"
                >
                  <dt class="text-label-medium">{{ t(item[0]) }}</dt>
                  <dd>{{ display.minutes(item[1]) }}</dd>
                </div>
              </dl>
              <AttendanceTransactions :rows="group.rows" links /> </HCardContent
          ></HCard>
        </template>
      </template></main
  ></IonPage>
</template>
