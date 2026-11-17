<script setup lang="ts">
import { HCard, HCardTitle, HCardContent } from "@/libs/ui";
import type { PtoBank } from "../AttendanceEntities";
import { useAttendancePresentationService } from "../AttendanceServiceContainer";
import { t } from "../locales";
const display = useAttendancePresentationService();
defineProps<{ bank: PtoBank | null; originals?: boolean }>();
const balances = ["annual", "seniority", "extended"] as const;
</script>
<template>
  <HCard
    ><HCardTitle>{{ t("remaining") }}</HCardTitle
    ><HCardContent>
      <p v-if="!bank">{{ t("noBank") }}</p>
      <template v-else>
        <p class="text-headline-small mb-4">
          {{
            display.minutes(
              bank.annual_balance +
                bank.seniority_balance +
                bank.extended_balance,
            )
          }}
        </p>
        <dl class="grid gap-3 sm:grid-cols-3">
          <div v-for="kind in balances" :key="kind">
            <dt class="text-label-large">{{ t(kind) }}</dt>
            <dd>{{ display.minutes(bank[`${kind}_balance`]) }}</dd>
            <dd
              v-if="originals"
              class="text-body-small text-on-surface-variant"
            >
              {{ t("original") }}:
              {{ display.minutes(bank[`original_${kind}_balance`]) }}
            </dd>
          </div>
        </dl>
      </template>
    </HCardContent></HCard
  >
</template>
