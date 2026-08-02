import type { BackendPort } from "@/ports/backend/BackendPort";
import type {
  TranslationLanguage,
  TranslationResult,
} from "@/modules/translation/TranslationTypes";
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
      this.translationStore.supportedLanguages.length > 0 ||
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

  public async fetchTranslationHistories(
    page: number,
    perPage: number = 5,
  ): Promise<void> {
    if (this.translationStore.isFetchingHistories) {
      return;
    }

    this.translationStore.isFetchingHistories = true;

    const { data, error, count } = await this.backendPort.spbClient
      .from("translation_histories")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

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

  public resetHistories(): void {
    this.translationStore.histories = [];
    this.translationStore.totalHistoriesCount = 0;
    this.translationStore.currentHistoryPage = 1;
    this.translationStore.isFetchingHistories = false;
    this.translationStore.hasLoadedHistories = false;
  }
}
