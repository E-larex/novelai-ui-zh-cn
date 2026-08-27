export type TranslatableAttribute = "aria-label" | "placeholder" | "title";

export interface DynamicTranslation {
  readonly pattern: RegExp;
  readonly translate: (match: RegExpMatchArray) => string;
}

export interface TranslationCatalog {
  readonly text: ReadonlyMap<string, string>;
  readonly resultText: ReadonlyMap<string, string>;
  readonly historyText: ReadonlyMap<string, string>;
  readonly characterGenderText: ReadonlyMap<string, string>;
  readonly imageImportText: ReadonlyMap<string, string>;
  readonly notificationText: ReadonlyMap<string, string>;
  readonly promptChunksText: ReadonlyMap<string, string>;
  readonly promptPreviewText: ReadonlyMap<string, string>;
  readonly selectText: ReadonlyMap<string, string>;
  readonly attributes: ReadonlyMap<string, string>;
  readonly dynamicText: readonly DynamicTranslation[];
  readonly dynamicNotificationText: readonly DynamicTranslation[];
  readonly dynamicAttributes: readonly DynamicTranslation[];
}
