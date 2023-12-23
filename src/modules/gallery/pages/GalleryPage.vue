<script setup lang="ts">

import {RouterView} from "vue-router";
</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive :exclude="['GalleryDetailPage']">
      <component :is="Component"/>
    </keep-alive>
  </router-view>
</template>

<style scoped>

</style>