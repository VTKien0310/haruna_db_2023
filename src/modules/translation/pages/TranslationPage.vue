<script setup lang="ts">
import { IonPage, onIonViewDidEnter } from "@ionic/vue";
import { computed, ref } from "vue";
import type { TranslationLanguage } from "@/modules/translation/TranslationTypes";
import { useTranslationService } from "@/modules/translation/TranslationServiceContainer";
import { useToastService } from "@/modules/master/MasterServiceContainer";
import { VaButton, VaIcon, VaSelect, VaTextarea } from "vuestic-ui";

const translationService = useTranslationService();
const toastService = useToastService();

const supportedLanguages = ref<TranslationLanguage[]>([]);
const isLoadingLanguages = ref<boolean>(false);

const sourceLanguage = ref<string>("en");
const targetLanguage = ref<string>("vi");

const sourceText = ref<string>("");
const translatedText = ref<string>("");
const isTranslating = ref<boolean>(false);

type TranslationCacheKey = {
  text: string;
  source: string;
  target: string;
};

// guards against wasting AI tokens on repeated identical translation requests
let lastTranslationKey: TranslationCacheKey | null = null;

onIonViewDidEnter(async () => {
  if (supportedLanguages.value.length > 0) {
    return;
  }

  isLoadingLanguages.value = true;
  supportedLanguages.value = await translationService.fetchSupportedLanguages();
  isLoadingLanguages.value = false;
});

const canTranslate = computed<boolean>(
  () =>
    !isLoadingLanguages.value &&
    !isTranslating.value &&
    sourceText.value.trim().length > 0 &&
    sourceLanguage.value !== targetLanguage.value,
);

const translate = async (): Promise<void> => {
  if (!canTranslate.value) {
    return;
  }

  const cacheKey: TranslationCacheKey = {
    text: sourceText.value.trim(),
    source: sourceLanguage.value,
    target: targetLanguage.value,
  };

  if (JSON.stringify(lastTranslationKey) === JSON.stringify(cacheKey)) {
    return;
  }

  isTranslating.value = true;
  const translation = await translationService.translate(
    cacheKey.text,
    cacheKey.source,
    cacheKey.target,
  );
  isTranslating.value = false;

  if (translation) {
    translatedText.value = translation;
    lastTranslationKey = cacheKey;
  }
};

const swapLanguages = (): void => {
  const previousSourceLanguage = sourceLanguage.value;
  sourceLanguage.value = targetLanguage.value;
  targetLanguage.value = previousSourceLanguage;

  const previousSourceText = sourceText.value;
  sourceText.value = translatedText.value;
  translatedText.value = previousSourceText;

  lastTranslationKey = null;
};

const copyTranslatedText = async (): Promise<void> => {
  if (!translatedText.value) {
    return;
  }

  await navigator.clipboard.writeText(translatedText.value);
  toastService.info("Copied to clipboard");
};

const clearSourceText = (): void => {
  sourceText.value = "";
};

const resetTranslation = (): void => {
  clearSourceText();
  translatedText.value = "";
  lastTranslationKey = null;
};
</script>

<template>
  <ion-page>
    <div class="bg-background-primary h-screen overflow-y-auto">
      <div class="mx-auto flex w-full max-w-6xl flex-col px-3 pt-3 pb-6">
        <!-- header -->
        <div class="flex flex-row flex-wrap items-center justify-end gap-2">
          <div class="flex flex-row gap-2">
            <va-button
              :disabled="!canTranslate"
              :loading="isTranslating"
              @click="translate"
            >
              Translate
            </va-button>
            <va-button
              preset="secondary"
              border-color="primary"
              :disabled="isTranslating"
              @click="swapLanguages"
            >
              Swap
            </va-button>
            <va-button
              preset="secondary"
              border-color="primary"
              @click="clearSourceText"
            >
              Clear
            </va-button>
            <va-button
              preset="secondary"
              border-color="primary"
              @click="resetTranslation"
            >
              Reset
            </va-button>
          </div>
        </div>

        <!-- language selection bar -->
        <div
          class="border-background-border bg-background-secondary mt-3 flex flex-col items-stretch gap-2 rounded border p-3 shadow-sm md:flex-row md:items-center"
        >
          <va-select
            v-model="sourceLanguage"
            :options="supportedLanguages"
            value-by="code"
            text-by="name"
            label="Source language"
            searchable
            :loading="isLoadingLanguages"
            class="w-full"
          />
          <va-select
            v-model="targetLanguage"
            :options="supportedLanguages"
            value-by="code"
            text-by="name"
            label="Target language"
            searchable
            :loading="isLoadingLanguages"
            class="w-full"
          />
        </div>

        <!-- translation panels -->
        <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <!-- source panel -->
          <div
            class="border-background-border bg-background-secondary flex flex-col rounded border p-3 shadow-sm"
          >
            <div class="mb-2 flex h-8 flex-row items-center justify-between">
              <span class="text-text-primary font-bold">Source text</span>
            </div>
            <va-textarea
              v-model="sourceText"
              :resize="false"
              counter
              placeholder="Enter text to translate..."
              class="translation-textarea w-full"
            />
          </div>

          <!-- output panel -->
          <div
            class="border-background-border bg-background-secondary flex flex-col rounded border p-3 shadow-sm"
          >
            <div class="mb-2 flex h-8 flex-row items-center justify-between">
              <span class="text-text-primary font-bold">Translation</span>
              <va-button
                v-if="translatedText"
                preset="plain"
                size="small"
                @click="copyTranslatedText"
              >
                <va-icon name="content_copy" />
              </va-button>
            </div>
            <va-textarea
              v-model="translatedText"
              :resize="false"
              :loading="isTranslating"
              background="background-element"
              readonly
              placeholder="Translation will appear here"
              class="translation-textarea w-full"
            />
          </div>
        </div>
      </div>
    </div>
  </ion-page>
</template>

<style scoped>
.translation-textarea {
  height: 35dvh;
}

@media (min-width: 1024px) {
  .translation-textarea {
    height: 60dvh;
  }
}
</style>
