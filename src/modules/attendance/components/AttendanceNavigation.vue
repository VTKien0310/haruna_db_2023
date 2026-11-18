<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/stores/AuthStore";
import { UserSpecialPermissionType } from "@/modules/auth/AuthEntities";
import {
  HSidebarItem,
  HSidebarItemContent,
  HSidebarItemTitle,
  HIcon,
} from "@/libs/ui";
import { AttendanceRouteName } from "../AttendanceRouter";
import { t } from "../locales";
const emit = defineEmits<{ navigate: [] }>();
const route = useRoute(),
  router = useRouter(),
  authStore = useAuthStore();
const active = computed(() => String(route.name).startsWith("attendance."));
const expanded = ref(active.value);
watch(
  () => route.fullPath,
  () => {
    if (active.value) expanded.value = true;
  },
);
const links = computed(() => [
  { name: AttendanceRouteName.LEDGER, label: t("ledger") },
  { name: AttendanceRouteName.CREATE, label: t("create") },
  { name: AttendanceRouteName.ENTRIES, label: t("entries") },
  ...(authStore.userSpecialPermissions.some(
    (row) =>
      row.permission === UserSpecialPermissionType.MANAGE_WORKDAY_EXCEPTIONS,
  )
    ? [
        {
          name: AttendanceRouteName.WORKDAY_EXCEPTIONS,
          label: t("workdayExceptions"),
        },
      ]
    : []),
]);
</script>
<template>
  <div>
    <HSidebarItem
      :aria-expanded="expanded"
      aria-controls="attendance-navigation"
      @click="expanded = !expanded"
      ><HSidebarItemContent
        ><HIcon name="event_available" /><HSidebarItemTitle>{{
          t("attendance")
        }}</HSidebarItemTitle
        ><HIcon
          :name="
            expanded ? 'expand_less' : 'expand_more'
          " /></HSidebarItemContent
    ></HSidebarItem>
    <div
      v-if="expanded"
      id="attendance-navigation"
      class="ml-4 flex flex-col gap-1"
    >
      <HSidebarItem
        v-for="link in links"
        :key="link.name"
        :active="
          route.name === link.name ||
          (link.name === AttendanceRouteName.ENTRIES &&
            route.name === AttendanceRouteName.DETAIL) ||
          (link.name === AttendanceRouteName.WORKDAY_EXCEPTIONS &&
            route.name === AttendanceRouteName.WORKDAY_EXCEPTION_CREATE)
        "
        @click="
          router.push({ name: link.name });
          emit('navigate');
        "
        ><HSidebarItemContent
          ><HSidebarItemTitle>{{
            link.label
          }}</HSidebarItemTitle></HSidebarItemContent
        ></HSidebarItem
      >
    </div>
  </div>
</template>
