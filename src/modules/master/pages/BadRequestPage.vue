<script setup lang="ts">
import { IonPage } from "@ionic/vue";
import { t } from "@/modules/master/locales";
</script>

<template>
  <ion-page>
    <img
      src="https://http.cat/images/400.jpg"
      class="m-auto max-h-screen max-w-full"
      :alt="t('badRequestImageAlt')"
    />
  </ion-page>
</template>

<style scoped></style>
