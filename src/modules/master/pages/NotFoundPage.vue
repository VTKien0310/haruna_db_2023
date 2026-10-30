<script setup lang="ts">
import { IonPage } from "@ionic/vue";
import { t } from "@/modules/master/locales";
</script>

<template>
  <ion-page>
    <img
      src="https://http.cat/images/404.jpg"
      class="m-auto max-h-screen max-w-full"
      :alt="t('notFoundImageAlt')"
    />
  </ion-page>
</template>

<style scoped></style>
