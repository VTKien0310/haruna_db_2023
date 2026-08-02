import { defineStore } from "pinia";
import { ref } from "vue";
import type { TranslationLanguage } from "@/modules/translation/TranslationTypes";
import type { TranslationHistory } from "@/modules/translation/TranslationEntities";

export const useTranslationStore = defineStore("translation", () => {
  const supportedLanguages = ref<TranslationLanguage[]>([]);
  const isLoadingLanguages = ref<boolean>(false);

  const histories = ref<TranslationHistory[]>([]);
  const totalHistoriesCount = ref<number>(0);
  const currentHistoryPage = ref<number>(1);
  const isFetchingHistories = ref<boolean>(false);
  const hasLoadedHistories = ref<boolean>(false);

  return {
    supportedLanguages,
    isLoadingLanguages,
    histories,
    totalHistoriesCount,
    currentHistoryPage,
    isFetchingHistories,
    hasLoadedHistories,
  };
});
