<script setup lang="ts">
import type { AttendanceEntry } from "../AttendanceTypes";

import {
  useAttendanceFormService,
  useAttendanceService,
} from "../AttendanceServiceContainer";
import { computed, reactive, ref } from "vue";
import {
  HForm,
  HInput,
  HTextarea,
  HSelect,
  HButton,
  type HFormHandle,
} from "@/libs/ui";
import { ENTRY_TABLES } from "../AttendanceEntities";
import { useAttendanceStore } from "../AttendanceStore";
import { t } from "../locales";
const forms = useAttendanceFormService();
const props = defineProps<{ entry?: AttendanceEntry }>();
const emit = defineEmits<{ saved: []; cancel: [] }>();
const form = reactive(
  props.entry ? forms.fromEntry(props.entry) : forms.empty(),
);
const service = useAttendanceService();
const store = useAttendanceStore();
const formRef = ref<HFormHandle>();
const kinds = ENTRY_TABLES.filter((k) => k !== "miss_check_in_entries").map(
  (value) => ({ value, label: t(value) }),
);
const periods = ["fullDay", "morning", "afternoon"].map((k, i) => ({
  value: String(i),
  label: t(k as "fullDay" | "morning" | "afternoon"),
}));
const shifts = [
  { value: "0", label: t("morning") },
  { value: "1", label: t("afternoon") },
];
const directions = [
  { value: "0", label: t("late") },
  { value: "1", label: t("early") },
];
const isPeriod = computed(() =>
  ["time_off_entries", "remote_work_entries"].includes(form.kind),
);
const error = ref("");
async function submit() {
  error.value = forms.validate(form, props.entry);
  if (!formRef.value?.validate() || error.value) return;
  if (await service.save({ ...form }, props.entry)) {
    if (!props.entry) Object.assign(form, forms.empty());
    emit("saved");
  }
}
</script>
<template>
  <HForm ref="formRef" class="flex flex-col gap-4" @submit.prevent="submit">
    <HSelect
      v-model="form.kind"
      :options="kinds"
      text-by="label"
      value-by="value"
      :label="t('kind')"
      :disabled="Boolean(entry) || store.state.saving"
    />
    <div
      v-if="form.kind === 'check_in_entries' && !entry"
      class="flex flex-col gap-2"
    >
      <p>{{ t("missed") }}</p>
      <p v-if="store.state.missedStatus === 'loading'">{{ t("loading") }}</p>
      <HButton
        v-else-if="store.state.missedStatus === 'error'"
        variant="outlined"
        @click="service.loadMissed()"
        >{{ t("retry") }}</HButton
      >
      <HSelect
        v-else-if="store.state.missed.length"
        :model-value="form.date"
        @update:model-value="form.date = $event"
        :options="store.state.missed.map((value) => ({ value, label: value }))"
        text-by="label"
        value-by="value"
        :label="t('chooseDate')"
      />
      <p v-else>{{ t("noMissed") }}</p>
    </div>
    <HInput
      v-model="form.date"
      type="date"
      :label="t('date')"
      required
      :disabled="store.state.saving"
    />
    <template v-if="isPeriod"
      ><HSelect
        v-model="form.period"
        :options="periods"
        text-by="label"
        value-by="value"
        :label="t('period')"
        :disabled="store.state.saving"
    /></template>
    <template v-if="form.kind === 'time_off_entries'"
      ><p class="text-body-small">{{ t("rangeHint") }}</p>
      <HInput
        v-if="!entry"
        v-model="form.endDate"
        type="date"
        :label="t('endDate')"
        :disabled="store.state.saving"
    /></template>
    <template v-if="form.kind === 'work_time_entries'"
      ><HSelect
        v-model="form.shift"
        :options="shifts"
        text-by="label"
        value-by="value"
        :label="t('shift')"
        :disabled="store.state.saving" /><HSelect
        v-model="form.direction"
        :options="directions"
        text-by="label"
        value-by="value"
        :label="t('direction')"
        :disabled="store.state.saving"
    /></template>
    <HInput
      v-if="!isPeriod"
      v-model="form.clock"
      type="time"
      :label="
        form.kind === 'leave_work_entries'
          ? t('start')
          : form.kind === 'check_in_entries'
            ? t('arrival')
            : form.direction === '0'
              ? t('coverageEnd')
              : t('departure')
      "
      required
      :disabled="store.state.saving"
    />
    <HInput
      v-if="form.kind === 'leave_work_entries'"
      v-model="form.endClock"
      type="time"
      :label="t('end')"
      required
      :disabled="store.state.saving"
    />
    <HInput
      v-if="form.kind !== 'check_in_entries'"
      v-model="form.title"
      :label="t('title')"
      :disabled="store.state.saving"
    />
    <HTextarea
      v-model="form.note"
      :label="t('note')"
      :disabled="store.state.saving"
    />
    <HButton
      v-if="form.kind !== 'remote_work_entries'"
      variant="outlined"
      :aria-pressed="form.exempt"
      :disabled="store.state.saving"
      @click="form.exempt = !form.exempt"
      :icon="form.exempt ? 'check_box' : 'check_box_outline_blank'"
      >{{ t("exempt") }}</HButton
    >
    <p v-else>{{ t("remoteExempt") }}</p>
    <p v-if="error" role="alert" class="text-error">{{ error }}</p>
    <div class="flex gap-2">
      <HButton type="submit" :disabled="store.state.saving">{{
        store.state.saving ? t("saving") : t("save")
      }}</HButton
      ><HButton
        v-if="entry"
        variant="outlined"
        :disabled="store.state.saving"
        @click="emit('cancel')"
        >{{ t("cancel") }}</HButton
      >
    </div>
  </HForm>
</template>
