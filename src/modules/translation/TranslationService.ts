import type { BackendPort } from "@/ports/backend/BackendPort";
import type {
  TranslationLanguage,
  TranslationResult,
} from "@/modules/translation/TranslationTypes";
import type { TranslationHistory } from "@/modules/translation/TranslationEntities";
import type { ToastService } from "@/modules/master/services/ToastService";

export class TranslationService {
  constructor(
    private readonly backendPort: BackendPort,
    private readonly toastService: ToastService,
  ) {}

  public async fetchSupportedLanguages(): Promise<TranslationLanguage[]> {
    const languagesResult = await this.backendPort.get<TranslationLanguage[]>(
      "translation/languages",
    );

    if (languagesResult.isErr()) {
      this.toastService.error("Failed to load supported languages");

      return [];
    }

    return languagesResult.unwrap();
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
    perPage: number = 10,
  ): Promise<{ histories: TranslationHistory[]; totalCount: number }> {
    const { data, error, count } = await this.backendPort.spbClient
      .from("translation_histories")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error || data === null || count === null) {
      this.toastService.error("Failed to fetch translation histories");

      return { histories: [], totalCount: 0 };
    }

    return { histories: data, totalCount: count };
  }
}
