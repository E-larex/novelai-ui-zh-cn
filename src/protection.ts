const PROMPT_PREVIEW_MARKERS = new Set([
  "Added to the end of the prompt:",
  "Added to the beginning of the UC:",
]);

const allowedComboboxLabels = new Set([
  "Select the Model",
  "Quality Preset",
  "Undesired Content Preset",
  "Select a Resolution Category",
  "Select a sampler",
  "选择模型",
  "质量预设",
  "负面内容预设",
  "选择分辨率类别",
  "选择采样器",
]);

const PROMPT_CLASS_PATTERN =
  /(?:^|[-_])(prompt-input-box|prompt-suggestion|prompt-autocomplete|tag-suggestion)(?:$|[-_])/i;

function classNames(element: Element): string[] {
  return typeof element.className === "string" ? element.className.split(/\s+/) : [];
}

export function isPromptEditorElement(element: Element): boolean {
  if (
    element.matches(
      '.ProseMirror, textarea, [contenteditable="true"], [data-prompt], [data-testid*="prompt" i]',
    )
  ) {
    return true;
  }

  return classNames(element).some((name) => PROMPT_CLASS_PATTERN.test(name));
}

export function isInsidePromptEditor(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  return (
    Boolean(element?.closest('.ProseMirror, textarea, [contenteditable="true"], [data-prompt]')) ||
    hasPromptClassAncestor(element)
  );
}

function hasPromptClassAncestor(element: Element | null): boolean {
  let current = element;
  while (current) {
    if (isPromptEditorElement(current)) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

export function isInsideResultStage(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  return Boolean(element?.closest(".image-gen-results-stage"));
}

export function isInsideHistory(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  let current = element;
  while (current) {
    if (classNames(current).some((name) => /history/i.test(name))) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

export function isPromptPreviewText(node: Text): boolean {
  const parent = node.parentElement;
  const container = parent?.parentElement;
  if (!parent || !container || parent.tagName !== "P") {
    return false;
  }

  return Array.from(container.children).some(
    (child) => child !== parent && PROMPT_PREVIEW_MARKERS.has(child.textContent?.trim() ?? ""),
  );
}

export function isAllowedSelectText(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) {
    return false;
  }

  const select = parent.closest(".select");
  const label = select?.querySelector('input[role="combobox"]')?.getAttribute("aria-label");
  if (label && allowedComboboxLabels.has(label)) {
    return true;
  }

  if (!parent.closest('[role="listbox"], [role="option"]')) {
    return false;
  }

  const active = parent.ownerDocument.activeElement;
  return (
    active instanceof HTMLInputElement &&
    active.getAttribute("role") === "combobox" &&
    active.getAttribute("aria-expanded") === "true" &&
    allowedComboboxLabels.has(active.getAttribute("aria-label") ?? "")
  );
}

export function shouldSkipElement(element: Element): boolean {
  return element.matches("script, style, noscript, template") || isPromptEditorElement(element);
}

export function canTranslateAttribute(element: Element, name: string): boolean {
  if (name !== "aria-label" && name !== "title") {
    return false;
  }
  if (element instanceof HTMLImageElement || isInsidePromptEditor(element)) {
    return false;
  }
  return true;
}
