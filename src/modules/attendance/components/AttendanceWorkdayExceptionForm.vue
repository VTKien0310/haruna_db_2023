<script setup lang="ts">
import { reactive, ref } from "vue";
import { HButton, HForm, HInput, HSelect, type HFormHandle } from "@/libs/ui";
import {
  useAttendanceFormService,
  useAttendanceService,
} from "../AttendanceServiceContainer";
import { WorkdayExceptionType } from "../AttendanceEntities";
import { useAttendanceStore } from "../AttendanceStore";
import { t } from "../locales";

const emit = defineEmits<{ saved: []; cancel: [] }>();
const forms = useAttendanceFormService();
const service = useAttendanceService();
const store = useAttendanceStore();
const form = reactive(forms.emptyWorkdayException());
const formRef = ref<HFormHandle>();
const error = ref("");
const types = [
  { value: String(WorkdayExceptionType.HOLIDAY), label: t("holiday") },
  { value: String(WorkdayExceptionType.WORKDAY), label: t("workday") },
];
const periods = ["fullDay", "morning", "afternoon"].map((key, value) => ({
  value: String(value),
  label: t(key as "fullDay" | "morning" | "afternoon"),
}));

async function submit(): Promise<void> {
  error.value = forms.validateWorkdayException(form);
  if (!formRef.value?.validate() || error.value) return;
  if (await service.createWorkdayException({ ...form })) {
    Object.assign(form, forms.emptyWorkdayException());
    emit("saved");
  }
}
</script>

<template>
  <HForm ref="formRef" class="flex flex-col gap-4" @submit.prevent="submit">
    <HSelect
      v-model="form.type"
      :options="types"
      text-by="label"
      value-by="value"
      :label="t('workdayExceptionType')"
      :disabled="store.state.saving"
    />
    <HInput
      v-model="form.date"
      type="date"
      :label="t('date')"
      required
      :disabled="store.state.saving"
    />
    <HSelect
      v-model="form.time"
      :options="periods"
      text-by="label"
      value-by="value"
      :label="t('period')"
      :disabled="store.state.saving"
    />
    <HInput
      v-model="form.title"
      :label="t('title')"
      required
      :disabled="store.state.saving"
    />
    <p class="text-body-small text-on-surface-variant">
      {{
        form.type === String(WorkdayExceptionType.HOLIDAY)
          ? t("workdayExceptionHolidayHint")
          : t("workdayExceptionWorkdayHint")
      }}
    </p>
    <p v-if="error" role="alert" class="text-error">{{ error }}</p>
    <div class="flex flex-wrap gap-2">
      <HButton
        type="submit"
        :disabled="store.state.saving"
        :loading="store.state.saving"
        >{{ store.state.saving ? t("saving") : t("save") }}</HButton
      >
      <HButton
        variant="outlined"
        :disabled="store.state.saving"
        @click="emit('cancel')"
        >{{ t("cancel") }}</HButton
      >
    </div>
  </HForm>
</template>
