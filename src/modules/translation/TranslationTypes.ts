export enum LanguageCode {
  JA = "JA",
  EN = "EN",
}

export type OriginalLanguageOption = {
  value: LanguageCode;
  label: string;
};

export type DebounceTimeOption = {
  value: number;
  label: string;
};
