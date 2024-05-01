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
  ogContentInputTimeout = setTimeout(initTranslation, 1000);
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
    <div class="flex flex-col justify-start h-screen overflow-y-scroll overflow-x-auto px-3 pt-3 pb-14 sm:mb-14">

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

      <div class="translation-form flex justify-around h-fit pt-3 flex-col md:flex-row">
        <va-textarea
            v-model="originalContent"
            @input="debounceOgContentInput"
            autosize
            min-rows="10"
            label="Original content"
            class="w-full h-fit md:mr-2"
            counter
        />
        <va-textarea
            v-model="translatedContent"
            :loading="isTranslating"
            autosize
            min-rows="10"
            label="Translated content"
            class="w-full h-fit md:ml-2"
            background="background-element"
            readonly
        />
      </div>

    </div>
  </ion-page>
</template>

<style scoped>
@media (min-width: 768px) {
  .translation-form {
    min-height: 50dvh;
  }
}
</style>
