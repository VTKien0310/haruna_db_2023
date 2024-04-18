<script setup lang="ts">
import {IonPage, onIonViewWillLeave} from '@ionic/vue';
import {ref} from 'vue';
import {LanguageCode, type OriginalLanguageOption} from '@/modules/translation/TranslationTypes';
import provider from "@/provider";

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

let ogContentInputTimeout: ReturnType<typeof setTimeout> | null | undefined = null;
const clearOgContentInputTimeout = (): void => {
  if (ogContentInputTimeout) {
    clearTimeout(ogContentInputTimeout)
  }
}
const debounceOgContentInput = () => {
  clearOgContentInputTimeout()
  ogContentInputTimeout = setTimeout(initTranslation, 2000);
}

const originalContent = ref<string>('');
const lastOgContent = ref<string>('');
const initTranslation = (): void => {
  clearOgContentInputTimeout()

  if (originalContent.value === lastOgContent.value || !originalContent.value) {
    return
  }

  lastOgContent.value = originalContent.value
  translate()
}

const translationService = provider.translationService()
const translatedContent = ref<string>('');
const isTranslating = ref<boolean>(false)
const translate = () => {
  isTranslating.value = true;
  translationService.translate(originalContent.value, originalLanguage.value).then(
      (translation: string): void => {
        translatedContent.value = translation
        isTranslating.value = false
      }
  )
}

const clearOgContent = () => {
  originalContent.value = '';
}

const resetTranslation = (): void => {
  clearOgContent()
  translatedContent.value = '';
}

onIonViewWillLeave(() => {
  clearOgContentInputTimeout()
})
</script>

<template>
  <ion-page>
    <div class="flex min-h-screen m-3 flex-col justify-start">

      <div class="flex justify-start w-full md:w-1/5 lg:w-1/6">
        <va-select
            v-model="originalLanguage"
            :options="originalLanguageOptionSelections"
            value-by="value"
            text-by="label"
            label="Source language"
            inner-label
        />
        <va-button @click="clearOgContent" preset="secondary" border-color="primary" class="ml-3">
          Clear
        </va-button>
        <va-button @click="resetTranslation" preset="secondary" border-color="primary" class="ml-3">
          Reset
        </va-button>
      </div>

      <div class="flex justify-around pt-3 flex-col md:flex-row">
        <va-textarea
            v-model="originalContent"
            @input="debounceOgContentInput"
            label="Original content"
            class="w-full md:mr-2"
            counter
        />
        <va-textarea
            v-model="translatedContent"
            :loading="isTranslating"
            label="Translated content"
            class="w-full md:ml-2"
            background="background-element"
            readonly
        />
      </div>

    </div>
  </ion-page>
</template>

<style scoped>

</style>
