<script setup lang="ts">
import { IonPage, onIonViewDidEnter } from "@ionic/vue";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import type { TranslationHistory } from "@/modules/translation/TranslationEntities";
import type { TranslationDraft } from "@/modules/translation/TranslationTypes";
import { useTranslationService } from "@/modules/translation/TranslationServiceContainer";
import { useTranslationStore } from "@/modules/translation/stores/TranslationStore";
import { t } from "@/modules/translation/locales";
import { useToastService } from "@/modules/master/MasterServiceContainer";
import {
  HButton,
  HPagination,
  HProgressBar,
  HSelect,
  HTextarea,
} from "@/libs/ui";

const translationService = useTranslationService();
const translationStore = useTranslationStore();
const toastService = useToastService();
const route = useRoute();

const sourceLanguage = ref<string>("ja");
const targetLanguage = ref<string>("en");

const sourceText = ref<string>("");
const translatedText = ref<string>("");
const isTranslating = ref<boolean>(false);

const historiesPerPage = 5;

const totalHistoryPages = computed<number>(() =>
  Math.ceil(translationStore.totalHistoriesCount / historiesPerPage),
);

const fetchHistories = async (page: number): Promise<void> =>
  translationService.fetchTranslationHistories(page, historiesPerPage);

const isFetchingHistories = computed<boolean>(
  () =>
    translationStore.isFetchingHistories ||
    translationStore.isFetchingLatestHistories,
);

const canTranslate = computed<boolean>(
  () =>
    !translationStore.isLoadingLanguages &&
    !isTranslating.value &&
    sourceText.value.trim().length > 0 &&
    sourceLanguage.value !== targetLanguage.value,
);

const getDraft = (): TranslationDraft => ({
  sourceLanguage: sourceLanguage.value,
  targetLanguage: targetLanguage.value,
  sourceText: sourceText.value,
  translatedText: translatedText.value,
});

const applyDraft = (draft: TranslationDraft): void => {
  sourceLanguage.value = draft.sourceLanguage;
  targetLanguage.value = draft.targetLanguage;
  sourceText.value = draft.sourceText;
  translatedText.value = draft.translatedText;
};

const translate = async (): Promise<void> => {
  if (!canTranslate.value) {
    return;
  }

  isTranslating.value = true;
  const translation = await translationService.translateIfNeeded(
    sourceText.value,
    sourceLanguage.value,
    targetLanguage.value,
  );
  isTranslating.value = false;

  if (translation !== null) {
    translatedText.value = translation;
  }
};

const swapLanguages = (): void => {
  applyDraft(translationService.swapDraft(getDraft()));
};

const copyTranslatedText = async (): Promise<void> => {
  if (!translatedText.value) {
    return;
  }

  await navigator.clipboard.writeText(translatedText.value);
  toastService.info(t("copied"));
};

const clearSourceText = (): void => {
  sourceText.value = "";
};

const resetTranslation = (): void => {
  applyDraft(translationService.resetDraft(getDraft()));
};

const resolveLanguageName = (code: string): string =>
  translationService.resolveLanguageName(code);

const isHistoryRecordActive = (record: TranslationHistory): boolean =>
  translationService.isHistoryRecordActive(record, getDraft());

const fillFromHistory = (record: TranslationHistory): void => {
  if (isHistoryRecordActive(record)) {
    return;
  }

  applyDraft(translationService.getDraftFromHistory(record));
};

onIonViewDidEnter(async () => {
  // navigated from the master page with a history record to fill into the UI
  const historyId = route.query.history;
  const record = await translationService.initialize(
    typeof historyId === "string" && historyId.length > 0
      ? historyId
      : undefined,
  );

  if (record) {
    fillFromHistory(record);
  }
});
</script>

<template>
  <ion-page>
    <div class="bg-background-primary h-full overflow-y-auto">
      <div class="mx-auto flex w-full max-w-6xl flex-col px-3 pt-3 pb-6">
        <!-- header -->
        <div class="flex flex-row flex-wrap items-center justify-end gap-2">
          <div class="flex flex-row gap-2">
            <h-button
              :disabled="!canTranslate"
              :loading="isTranslating"
              @click="translate"
            >
              {{ t("translateButton") }}
            </h-button>
            <h-button
              variant="outlined"
              :disabled="isTranslating"
              @click="swapLanguages"
            >
              {{ t("swapButton") }}
            </h-button>
            <h-button variant="outlined" @click="clearSourceText">
              {{ t("clearButton") }}
            </h-button>
            <h-button variant="outlined" @click="resetTranslation">
              {{ t("resetButton") }}
            </h-button>
          </div>
        </div>

        <!-- language selection bar -->
        <div
          class="border-background-border bg-background-secondary mt-4 flex flex-col items-stretch gap-4 rounded-(--h-panel-radius) border p-4 md:flex-row md:items-center"
        >
          <h-select
            v-model="sourceLanguage"
            :options="translationStore.supportedLanguages"
            value-by="code"
            text-by="name"
            :label="t('sourceLanguageLabel')"
            searchable
            :loading="translationStore.isLoadingLanguages"
            class="w-full"
          />
          <h-select
            v-model="targetLanguage"
            :options="translationStore.supportedLanguages"
            value-by="code"
            text-by="name"
            :label="t('targetLanguageLabel')"
            searchable
            :loading="translationStore.isLoadingLanguages"
            class="w-full"
          />
        </div>

        <!-- translation panels -->
        <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <!-- source panel -->
          <div
            class="border-background-border bg-background-secondary flex flex-col rounded-(--h-panel-radius) border p-4"
          >
            <div class="mb-2 flex h-8 flex-row items-center justify-between">
              <span class="text-text-primary font-bold">{{
                t("sourceTextTitle")
              }}</span>
            </div>
            <h-textarea
              v-model="sourceText"
              counter
              :placeholder="t('sourceTextPlaceholder')"
              class="translation-textarea w-full"
            />
          </div>

          <!-- output panel -->
          <div
            class="border-background-border bg-background-secondary flex flex-col rounded-(--h-panel-radius) border p-4"
          >
            <div class="mb-2 flex h-8 flex-row items-center justify-between">
              <span class="text-text-primary font-bold">{{
                t("translationTitle")
              }}</span>
              <h-button
                v-if="translatedText"
                variant="quiet"
                size="small"
                icon="content_copy"
                :aria-label="t('copyTranslationLabel')"
                @click="copyTranslatedText"
              />
            </div>
            <h-textarea
              v-model="translatedText"
              :loading="isTranslating"
              readonly
              :placeholder="t('translationPlaceholder')"
              class="translation-textarea w-full"
            />
          </div>
        </div>

        <!-- translation histories -->
        <div class="mt-3 flex flex-col">
          <div class="mb-2 flex h-8 flex-row items-center justify-between">
            <span class="text-text-primary font-bold">{{
              t("historyTitle")
            }}</span>
          </div>

          <h-progress-bar v-if="isFetchingHistories" indeterminate />

          <div
            v-if="
              !isFetchingHistories && translationStore.histories.length === 0
            "
            class="text-secondary border-background-border bg-background-secondary flex flex-row items-center justify-center rounded-(--h-panel-radius) border p-6"
          >
            {{ t("noTranslationHistory") }}
          </div>

          <div class="flex flex-col gap-2">
            <div
              v-for="record in translationStore.histories"
              :key="record.id"
              @click="fillFromHistory(record)"
              class="border-background-border bg-background-secondary hover:bg-background-element flex cursor-pointer flex-col gap-1 rounded-(--h-control-radius) border p-3 transition-colors"
              :class="{
                'pointer-events-none opacity-50': isHistoryRecordActive(record),
              }"
            >
              <span class="text-primary text-sm font-bold">
                {{ resolveLanguageName(record.source_language) }} →
                {{ resolveLanguageName(record.target_language) }}
              </span>
              <span class="text-text-primary truncate">
                {{ record.source_text }}
              </span>
              <span class="text-secondary truncate">
                {{ record.translation }}
              </span>
            </div>
          </div>

          <div v-if="totalHistoryPages > 1" class="mt-3 flex justify-center">
            <h-pagination
              v-model="translationStore.currentHistoryPage"
              :pages="totalHistoryPages"
              :disabled="isFetchingHistories"
              @update:model-value="fetchHistories"
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
