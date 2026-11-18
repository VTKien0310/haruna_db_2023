<script setup lang="ts">
import { useRouter } from "vue-router";
import { HButton } from "@/libs/ui";
import type { PtoTransaction } from "../AttendanceEntities";
import { useAttendancePresentationService } from "../AttendanceServiceContainer";
import { AttendanceRouteName } from "../AttendanceRouter";
import { t } from "../locales";
const display = useAttendancePresentationService();
defineProps<{ rows: PtoTransaction[]; links?: boolean }>();
const router = useRouter();
</script>
<template>
  <p v-if="!rows.length">{{ t("noTransactions") }}</p>
  <ul v-else class="divide-outline-variant divide-y">
    <li
      v-for="row in rows"
      :key="row.id"
      class="flex flex-wrap items-center justify-between gap-3 py-3"
    >
      <div class="min-w-0">
        <p class="break-words">{{ display.transactionCause(row.cause) }}</p>
        <p class="text-body-small text-on-surface-variant">
          {{ display.dateTime(row.created_at) }}
        </p>
      </div>
      <div class="text-right">
        <p :class="{ 'text-success': row.type === 1 }">
          {{ row.type === 0 ? t("deducted") : t("restored") }}:
          {{ display.minutes(row.value - row.exceed_bank_value) }}
        </p>
        <p
          v-if="row.exceed_bank_value"
          class="text-body-small"
          :class="row.type === 0 ? 'text-error' : 'text-success'"
        >
          {{ row.type === 0 ? t("excess") : t("cancelled") }}:
          {{ display.minutes(row.exceed_bank_value) }}
        </p>
        <HButton
          v-if="links"
          variant="text"
          @click="
            router.push({
              name: AttendanceRouteName.DETAIL,
              params: { id: row.entry_id },
            })
          "
          >{{ t("details") }}</HButton
        >
      </div>
    </li>
  </ul>
</template>
