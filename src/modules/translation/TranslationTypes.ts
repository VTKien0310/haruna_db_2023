export type TranslationLanguage = {
  code: string;
  name: string;
};

export type TranslationResult = {
  translated_text: string;
};

export type TranslationDraft = {
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
};
