const PROMPT_PREVIEW_MARKERS = new Set([
  "Added to the end of the prompt:",
  "Added to the beginning of the UC:",
]);

const PROMPT_CHUNKS_TAB_LABELS = {
  chunks: new Set(["Prompt Chunks", "提示词片段"]),
  settings: new Set(["Settings", "设置"]),
};

const PROMPT_CHUNKS_CONTROL_LABELS = [
  "Add Prompt Chunk",
  "添加提示词片段",
  "Disable Tag Suggestions",
  "禁用标签建议",
  "Highlight Emphasis",
  "高亮强调语法",
  "Delete All",
  "全部删除",
];

const CHARACTER_GENDER_LABELS = {
  female: new Set(["Female", "女性"]),
  male: new Set(["Male", "男性"]),
  other: new Set(["Other", "其他"]),
};

const IMAGE_IMPORT_HEADINGS = new Set([
  "What do you want to do with this image?",
  "你想如何使用这张图像？",
]);

const IMAGE_IMPORT_BUTTONS = new Set([
  "Image2Image",
  "图生图",
  "Vibe Transfer",
  "氛围迁移",
  "Precise Reference",
  "精确参考",
  "Import Metadata",
  "导入元数据",
]);

const IMAGE_IMPORT_CHECKBOXES = new Set([
  "Prompt",
  "提示词",
  "Undesired Content",
  "不希望出现的内容",
  "Characters",
  "角色",
  "Append",
  "追加",
  "Settings",
  "设置",
  "Seed",
  "种子",
  "Clean Imports",
  "清理导入内容",
]);

const IMAGE_IMPORT_COPY = new Set([
  "This image has metadata!",
  "此图像包含元数据！",
  "Did you want to import that instead?",
  "是否要改为导入这些元数据？",
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

function isPromptChunksTabBar(element: Element): boolean {
  if (element.children.length !== 2) {
    return false;
  }
  const labels = Array.from(element.children).map((child) => child.textContent?.trim() ?? "");
  return (
    labels.some((label) => PROMPT_CHUNKS_TAB_LABELS.chunks.has(label)) &&
    labels.some((label) => PROMPT_CHUNKS_TAB_LABELS.settings.has(label))
  );
}

function looksLikeCharacterGenderMenu(element: Element): boolean {
  if (element === element.ownerDocument.body || element === element.ownerDocument.documentElement) {
    return false;
  }
  const descendants = Array.from(element.querySelectorAll("*"));
  if (descendants.length > 15) {
    return false;
  }
  const labels = descendants
    .filter((child) => child.children.length === 0)
    .map((child) => child.textContent?.trim() ?? "");
  const nonemptyLabels = labels.filter(Boolean);
  return (
    nonemptyLabels.length === 3 &&
    labels.some((label) => CHARACTER_GENDER_LABELS.female.has(label)) &&
    labels.some((label) => CHARACTER_GENDER_LABELS.male.has(label)) &&
    labels.some((label) => CHARACTER_GENDER_LABELS.other.has(label))
  );
}

export function isCharacterGenderOption(node: Text): boolean {
  let current = node.parentElement;
  for (let depth = 0; current && depth < 5; depth += 1) {
    if (looksLikeCharacterGenderMenu(current)) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

function imageImportDialog(node: Node): Element | null {
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  const dialog = element?.closest('[role="dialog"]');
  if (!dialog) {
    return null;
  }

  const hasHeading = Array.from(dialog.querySelectorAll("*")).some(
    (child) =>
      child.children.length === 0 && IMAGE_IMPORT_HEADINGS.has(child.textContent?.trim() ?? ""),
  );
  const hasImportButton = Array.from(dialog.querySelectorAll("button")).some((button) =>
    new Set(["Import Metadata", "导入元数据"]).has(button.textContent?.trim() ?? ""),
  );
  return hasHeading && hasImportButton ? dialog : null;
}

export function isInsideImageImportDialog(node: Node): boolean {
  return Boolean(imageImportDialog(node));
}

export function isImageImportChromeText(node: Text, source: string): boolean {
  if (!imageImportDialog(node)) {
    return false;
  }

  const parent = node.parentElement;
  if (!parent) {
    return false;
  }
  if (IMAGE_IMPORT_HEADINGS.has(source) || IMAGE_IMPORT_COPY.has(source)) {
    return parent.children.length === 0;
  }
  if (IMAGE_IMPORT_BUTTONS.has(source)) {
    return parent.closest("button") !== null;
  }
  if (IMAGE_IMPORT_CHECKBOXES.has(source)) {
    return Boolean(parent.closest("label")?.querySelector('input[type="checkbox"]'));
  }
  return false;
}

export function isInsideNotification(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  return Boolean(
    element?.closest('.Toastify, [data-sonner-toaster], [data-sonner-toast], [role="status"]'),
  );
}

function looksLikePromptChunksPanel(element: Element): boolean {
  const hasTabBar = Array.from(element.querySelectorAll("div")).some(isPromptChunksTabBar);
  if (!hasTabBar) {
    return false;
  }

  const hasControl = PROMPT_CHUNKS_CONTROL_LABELS.some(
    (label) =>
      element.querySelector(`[aria-label="${label}"]`) ||
      Array.from(element.querySelectorAll("button")).some(
        (button) => button.textContent?.trim() === label,
      ),
  );
  return Boolean(hasControl);
}

function promptChunksPanel(node: Node): Element | null {
  let current = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  while (current) {
    if (looksLikePromptChunksPanel(current)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

export function isInsidePromptChunksPanel(node: Node): boolean {
  return Boolean(promptChunksPanel(node));
}

export function isPromptChunksChromeText(node: Text, source: string): boolean {
  const parent = node.parentElement;
  const panel = promptChunksPanel(node);
  if (!parent) {
    return false;
  }

  if (source === "No custom prompt chunks yet. Click + to add one.") {
    return true;
  }
  if (source === "Delete All") {
    return parent.closest("button") !== null;
  }
  if (source === "Disable Tag Suggestions" || source === "Highlight Emphasis") {
    return Boolean(parent.closest("label")?.querySelector('input[type="checkbox"]'));
  }
  if (source === "Settings" || source === "Prompt Chunks") {
    if (parent.parentElement && isPromptChunksTabBar(parent.parentElement)) {
      return true;
    }
    if (source === "Prompt Chunks") {
      if (!panel) {
        return false;
      }
      const headings = Array.from(panel.querySelectorAll("*"))
        .filter((element) => PROMPT_CHUNKS_TAB_LABELS.chunks.has(element.textContent?.trim() ?? ""))
        .filter((element) => element.children.length === 0)
        .filter(
          (element) => !element.parentElement || !isPromptChunksTabBar(element.parentElement),
        );
      return headings[0] === parent;
    }
  }
  return false;
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
  if (name !== "aria-label" && name !== "placeholder" && name !== "title") {
    return false;
  }
  if (element instanceof HTMLImageElement || isInsidePromptEditor(element)) {
    return false;
  }
  return true;
}
