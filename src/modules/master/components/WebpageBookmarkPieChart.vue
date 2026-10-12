<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  linkCount: number;
  directoryCount: number;
}>();

// Canvas colors cannot resolve CSS variables; read the shared theme after mount.
const colors = ref<string[]>([]);
onMounted(() => {
  const theme = getComputedStyle(document.documentElement);
  colors.value = ["--color-brand-cyan", "--color-brand-amber"].map((token) =>
    theme.getPropertyValue(token).trim(),
  );
});

const chartData = computed(() => ({
  labels: ["Links", "Directories"],
  datasets: [
    {
      data: [props.linkCount, props.directoryCount],
      backgroundColor: colors.value,
      borderWidth: 0,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
};
</script>

<template>
  <div class="flex h-44 items-center justify-center">
    <Doughnut v-if="colors.length" :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped></style>
