<script setup lang="ts">
import {IonPage} from '@ionic/vue';
import {ref} from 'vue';
import {LanguageCode, type OriginalLanguageOption} from '@/modules/translation/TranslationTypes';

const originalContent = ref<string>('');
const originalLanguage = ref<LanguageCode>(LanguageCode.JA);

const originalLanguageOptionSelections: OriginalLanguageOption[] = [
  {
    value: LanguageCode.JA,
    label: 'Japanese',
  },
  {
    value: LanguageCode.EN,
    label: 'English',
  },
];

const translatedContent = ref<string>('');

const initTranslation = () => {
  console.log('init translation');
}

</script>

<template>
  <ion-page>
    <div class="flex min-h-screen p-3 flex-col justify-start md:flex-col-reverse md:justify-end">

      <div class="flex justify-start w-full md:w-1/5 lg:w-1/6">
        <va-select
            v-model="originalLanguage"
            :options="originalLanguageOptionSelections"
            value-by="value"
            text-by="label"
        />
        <va-button @click="initTranslation" icon="translate" class="ml-3"/>
        <va-button icon="backspace" preset="secondary" border-color="primary" class="ml-3"/>
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
