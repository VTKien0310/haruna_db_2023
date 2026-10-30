<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useThemeStore } from "../stores/ThemeStore";
import { t } from "../locales";

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  linkCount: number;
  directoryCount: number;
}>();

// Canvas colors cannot resolve CSS variables; refresh them after palette changes.
const themeStore = useThemeStore();
const colors = ref<string[]>([]);
const legendColor = ref("");
function refreshColors(): void {
  const theme = getComputedStyle(document.documentElement);
  colors.value = ["--color-brand-cyan", "--color-brand-amber"].map((token) =>
    theme.getPropertyValue(token).trim(),
  );
  legendColor.value = theme.getPropertyValue("--color-text-primary").trim();
}
onMounted(refreshColors);
watch(() => themeStore.themeId, refreshColors, { flush: "post" });

const chartData = computed(() => ({
  labels: [t("elements.chartLinksLabel"), t("elements.chartDirectoriesLabel")],
  datasets: [
    {
      data: [props.linkCount, props.directoryCount],
      backgroundColor: colors.value,
      borderWidth: 0,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { color: legendColor.value },
    },
  },
}));
</script>

<template>
  <div class="flex h-44 items-center justify-center">
    <Doughnut v-if="colors.length" :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped></style>
