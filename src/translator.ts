import {
  canTranslateAttribute,
  isCharacterGenderOption,
  isAllowedSelectText,
  isInsideHistory,
  isInsidePromptChunksPanel,
  isInsidePromptEditor,
  isInsideResultStage,
  isPromptPreviewText,
  isPromptChunksChromeText,
  shouldSkipElement,
} from "./protection";
import { catalog as defaultCatalog } from "./translations";
import type { DynamicTranslation, TranslatableAttribute, TranslationCatalog } from "./types";

const translatableAttributes: readonly TranslatableAttribute[] = [
  "aria-label",
  "placeholder",
  "title",
];

function preserveWhitespace(original: string, translated: string): string {
  const leading = original.match(/^\s*/)?.[0] ?? "";
  const trailing = original.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translated}${trailing}`;
}

function translateDynamic(value: string, rules: readonly DynamicTranslation[]): string | undefined {
  for (const rule of rules) {
    const match = value.match(rule.pattern);
    if (match) {
      return rule.translate(match);
    }
  }
  return undefined;
}

export class UiTranslator {
  private observer: MutationObserver | undefined;
  private readonly pendingNodes = new Set<Node>();
  private flushScheduled = false;

  public constructor(
    private readonly document: Document,
    private readonly catalog: TranslationCatalog = defaultCatalog,
  ) {}

  public start(): void {
    if (this.observer) {
      return;
    }

    this.observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "childList") {
          for (const node of record.addedNodes) {
            this.pendingNodes.add(node);
          }
        } else {
          this.pendingNodes.add(record.target);
        }
      }
      this.scheduleFlush();
    });

    this.observer.observe(this.document, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...translatableAttributes],
    });

    if (this.document.documentElement) {
      this.translateSubtree(this.document.documentElement);
    }
  }

  public stop(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    this.pendingNodes.clear();
    this.flushScheduled = false;
  }

  public translateSubtree(root: Node): void {
    const stack: Node[] = [root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        this.translateTextNode(node as Text);
        continue;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (shouldSkipElement(element)) {
          continue;
        }
        this.translateAttributes(element);
      }

      for (let index = node.childNodes.length - 1; index >= 0; index -= 1) {
        const child = node.childNodes[index];
        if (child) {
          stack.push(child);
        }
      }
    }
  }

  private translateTextNode(node: Text): void {
    if (isInsidePromptEditor(node)) {
      return;
    }

    const original = node.nodeValue ?? "";
    const source = original.trim();
    if (!source) {
      return;
    }

    let translated: string | undefined;
    if (isCharacterGenderOption(node)) {
      translated = this.catalog.characterGenderText.get(source);
    } else if (isInsidePromptChunksPanel(node)) {
      translated = isPromptChunksChromeText(node, source)
        ? this.catalog.promptChunksText.get(source)
        : undefined;
    } else if (isPromptPreviewText(node)) {
      translated = this.catalog.promptPreviewText.get(source);
    } else if (isInsideResultStage(node)) {
      translated = this.catalog.resultText.get(source);
    } else if (isInsideHistory(node)) {
      translated = this.catalog.historyText.get(source);
    } else if (isAllowedSelectText(node)) {
      translated = this.catalog.selectText.get(source) ?? this.catalog.text.get(source);
    } else {
      translated =
        this.catalog.text.get(source) ?? translateDynamic(source, this.catalog.dynamicText);
    }

    if (translated && translated !== source) {
      node.nodeValue = preserveWhitespace(original, translated);
    }
  }

  private translateAttributes(element: Element): void {
    for (const attribute of translatableAttributes) {
      if (!canTranslateAttribute(element, attribute)) {
        continue;
      }
      const source = element.getAttribute(attribute);
      if (!source) {
        continue;
      }
      const translated =
        this.catalog.attributes.get(source) ??
        translateDynamic(source, this.catalog.dynamicAttributes);
      if (translated && translated !== source) {
        element.setAttribute(attribute, translated);
      }
    }
  }

  private scheduleFlush(): void {
    if (this.flushScheduled) {
      return;
    }
    this.flushScheduled = true;
    queueMicrotask(() => {
      this.flushScheduled = false;
      const nodes = [...this.pendingNodes];
      this.pendingNodes.clear();
      for (const node of nodes) {
        this.translateSubtree(node);
      }
    });
  }
}
