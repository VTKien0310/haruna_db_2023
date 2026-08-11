import type { BackendPort } from "@/ports/backend/BackendPort";
import type {
  TranslationDraft,
  TranslationLanguage,
  TranslationResult,
} from "@/modules/translation/TranslationTypes";
import type { TranslationHistory } from "@/modules/translation/TranslationEntities";
import { useTranslationStore } from "@/modules/translation/stores/TranslationStore";
import type { ToastService } from "@/modules/master/services/ToastService";

export class TranslationService {
  private readonly translationStore = useTranslationStore();

  constructor(
    private readonly backendPort: BackendPort,
    private readonly toastService: ToastService,
  ) {}

  public async loadSupportedLanguages(): Promise<void> {
    if (
      this.translationStore.supportedLanguages.length > 2 ||
      this.translationStore.isLoadingLanguages
    ) {
      return;
    }

    this.translationStore.isLoadingLanguages = true;

    const languagesResult = await this.backendPort.get<TranslationLanguage[]>(
      "translation/languages",
    );

    if (languagesResult.isErr()) {
      this.toastService.error("Failed to load supported languages");

      this.translationStore.isLoadingLanguages = false;

      return;
    }

    this.translationStore.supportedLanguages = languagesResult.unwrap();
    this.translationStore.isLoadingLanguages = false;
  }

  public async translate(
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    const translationResult = await this.backendPort.post<TranslationResult>(
      "translation/translate",
      {
        source_text: sourceText,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      },
    );

    if (translationResult.isErr()) {
      this.toastService.error("Failed to translate content");

      return "";
    }

    return translationResult.unwrap().translated_text;
  }

  public async translateIfNeeded(
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string | null> {
    const trimmedSourceText = sourceText.trim();
    const translationKey = JSON.stringify({
      text: trimmedSourceText,
      source: sourceLanguage,
      target: targetLanguage,
    });

    if (this.translationStore.lastTranslationKey === translationKey) {
      return null;
    }

    const translation = await this.translate(
      trimmedSourceText,
      sourceLanguage,
      targetLanguage,
    );

    if (!translation) {
      return null;
    }

    this.translationStore.lastTranslationKey = translationKey;
    await this.syncLatestTranslationHistories();

    return translation;
  }

  public swapDraft(draft: TranslationDraft): TranslationDraft {
    this.translationStore.lastTranslationKey = null;

    return {
      sourceLanguage: draft.targetLanguage,
      targetLanguage: draft.sourceLanguage,
      sourceText: draft.translatedText,
      translatedText: draft.sourceText,
    };
  }

  public resetDraft(draft: TranslationDraft): TranslationDraft {
    this.translationStore.lastTranslationKey = null;

    return {
      sourceLanguage: draft.sourceLanguage,
      targetLanguage: draft.targetLanguage,
      sourceText: "",
      translatedText: "",
    };
  }

  public isHistoryRecordActive(
    record: TranslationHistory,
    draft: TranslationDraft,
  ): boolean {
    return (
      record.source_language === draft.sourceLanguage &&
      record.target_language === draft.targetLanguage &&
      record.source_text === draft.sourceText &&
      record.translation === draft.translatedText
    );
  }

  public getDraftFromHistory(record: TranslationHistory): TranslationDraft {
    this.translationStore.lastTranslationKey = JSON.stringify({
      text: record.source_text.trim(),
      source: record.source_language,
      target: record.target_language,
    });

    return {
      sourceLanguage: record.source_language,
      targetLanguage: record.target_language,
      sourceText: record.source_text,
      translatedText: record.translation,
    };
  }

  public resolveLanguageName(code: string): string {
    return (
      this.translationStore.supportedLanguages.find(
        (language) => language.code === code,
      )?.name ?? code
    );
  }

  public async initialize(
    historyId?: string,
  ): Promise<TranslationHistory | null> {
    await this.loadSupportedLanguages();

    if (historyId) {
      await this.syncLatestTranslationHistories();

      return (
        this.translationStore.latestHistories.find(
          (history) => history.id === historyId,
        ) ?? null
      );
    }

    if (!this.translationStore.hasLoadedHistories) {
      await this.fetchTranslationHistories(1);
    }

    return null;
  }

  public async fetchTranslationHistories(
    page: number,
    perPage: number = 5,
  ): Promise<void> {
    if (this.translationStore.isFetchingHistories) {
      return;
    }

    this.translationStore.isFetchingHistories = true;

    const { data, error, count } = await this.queryTranslationHistories(
      page,
      perPage,
    );

    if (error || data === null || count === null) {
      this.toastService.error("Failed to fetch translation histories");

      this.translationStore.isFetchingHistories = false;

      return;
    }

    this.translationStore.histories = data;
    this.translationStore.totalHistoriesCount = count;
    this.translationStore.currentHistoryPage = page;
    this.translationStore.hasLoadedHistories = true;
    this.translationStore.isFetchingHistories = false;
  }

  public async fetchLatestTranslationHistories(): Promise<void> {
    if (this.translationStore.isFetchingLatestHistories) {
      return;
    }

    this.translationStore.isFetchingLatestHistories = true;

    const { data, error, count } = await this.queryTranslationHistories(1, 5);

    if (error || data === null || count === null) {
      this.toastService.error("Failed to fetch translation histories");

      this.translationStore.isFetchingLatestHistories = false;

      return;
    }

    this.translationStore.latestHistories = data;
    this.translationStore.hasLoadedLatestHistories = true;
    this.translationStore.isFetchingLatestHistories = false;
  }

  public async syncLatestTranslationHistories(): Promise<void> {
    if (this.translationStore.isFetchingLatestHistories) {
      return;
    }

    this.translationStore.isFetchingLatestHistories = true;

    const { data, error, count } = await this.queryTranslationHistories(1, 5);

    if (error || data === null || count === null) {
      this.toastService.error("Failed to fetch translation histories");

      this.translationStore.isFetchingLatestHistories = false;

      return;
    }

    this.translationStore.latestHistories = data;
    this.translationStore.hasLoadedLatestHistories = true;
    this.translationStore.isFetchingLatestHistories = false;

    // sync the paginated histories so both pages show the same latest records
    this.translationStore.histories = data;
    this.translationStore.totalHistoriesCount = count;
    this.translationStore.currentHistoryPage = 1;
    this.translationStore.hasLoadedHistories = true;
  }

  public resetHistories(): void {
    this.translationStore.lastTranslationKey = null;
    this.translationStore.histories = [];
    this.translationStore.totalHistoriesCount = 0;
    this.translationStore.currentHistoryPage = 1;
    this.translationStore.isFetchingHistories = false;
    this.translationStore.hasLoadedHistories = false;
    this.translationStore.latestHistories = [];
    this.translationStore.isFetchingLatestHistories = false;
    this.translationStore.hasLoadedLatestHistories = false;
  }

  private queryTranslationHistories(page: number, perPage: number) {
    return this.backendPort.spbClient
      .from("translation_histories")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);
  }
}
