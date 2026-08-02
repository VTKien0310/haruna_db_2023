import type { BackendPort } from "@/ports/backend/BackendPort";
import type {
  TranslationLanguage,
  TranslationResult,
} from "@/modules/translation/TranslationTypes";
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
}
