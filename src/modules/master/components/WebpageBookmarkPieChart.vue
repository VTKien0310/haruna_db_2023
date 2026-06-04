<script setup lang="ts">
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  linkCount: number;
  directoryCount: number;
}>();

const chartData = computed(() => ({
  labels: ["Links", "Directories"],
  datasets: [
    {
      data: [props.linkCount, props.directoryCount],
      backgroundColor: ["#154ec1", "#767c88"],
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
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped></style>
