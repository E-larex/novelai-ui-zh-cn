export type TranslatableAttribute = "aria-label" | "title";

export interface DynamicTranslation {
  readonly pattern: RegExp;
  readonly translate: (match: RegExpMatchArray) => string;
}

export interface TranslationCatalog {
  readonly text: ReadonlyMap<string, string>;
  readonly resultText: ReadonlyMap<string, string>;
  readonly historyText: ReadonlyMap<string, string>;
  readonly promptPreviewText: ReadonlyMap<string, string>;
  readonly selectText: ReadonlyMap<string, string>;
  readonly attributes: ReadonlyMap<string, string>;
  readonly dynamicText: readonly DynamicTranslation[];
  readonly dynamicAttributes: readonly DynamicTranslation[];
}
