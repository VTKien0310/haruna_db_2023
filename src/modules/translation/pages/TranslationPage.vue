<script setup lang="ts">
import {IonPage} from "@ionic/vue";
import {ref} from "vue";

const originalContent = ref<string>('')
const translatedContent = ref<string>('')

</script>

<template>
  <ion-page>
    <div class="flex min-h-screen p-3 flex-col justify-start md:flex-col-reverse md:justify-end">

      <div>
        <va-button>Translate</va-button>
      </div>

      <div class="flex justify-around pt-3 flex-col md:pt-0 md:flex-row">
        <va-textarea
            v-model="originalContent"
            label="Original content"
            class="w-full pr-1"
            autosize
            counter
        />
        <va-textarea
            v-model="originalContent"
            label="Translated content"
            class="w-full pl-1"
            background="background-element"
            autosize
            readonly
        />
      </div>

    </div>
  </ion-page>
</template>

<style scoped>

</style>