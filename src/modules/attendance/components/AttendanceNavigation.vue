<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
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
  router = useRouter();
const active = computed(() => String(route.name).startsWith("attendance."));
const expanded = ref(active.value);
watch(
  () => route.fullPath,
  () => {
    if (active.value) expanded.value = true;
  },
);
const links = [
  { name: AttendanceRouteName.LEDGER, label: t("ledger") },
  { name: AttendanceRouteName.CREATE, label: t("create") },
  { name: AttendanceRouteName.ENTRIES, label: t("entries") },
];
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
            route.name === AttendanceRouteName.DETAIL)
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
