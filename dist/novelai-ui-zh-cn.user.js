// ==UserScript==
// @name         NovelAI 图像界面简体中文
// @namespace    https://github.com/E-larex/novelai-ui-zh-cn
// @version      0.1.2
// @description  将 NovelAI 图像生成界面的固定文案翻译为简体中文，绝不修改提示词。
// @author       E-larex
// @license      MIT
// @homepageURL  https://github.com/E-larex/novelai-ui-zh-cn
// @supportURL   https://github.com/E-larex/novelai-ui-zh-cn/issues
// @updateURL    https://raw.githubusercontent.com/E-larex/novelai-ui-zh-cn/main/dist/novelai-ui-zh-cn.user.js
// @downloadURL  https://raw.githubusercontent.com/E-larex/novelai-ui-zh-cn/main/dist/novelai-ui-zh-cn.user.js
// @match        https://novelai.net/image*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==
"use strict";
(() => {
  // src/protection.ts
  var PROMPT_PREVIEW_MARKERS = /* @__PURE__ */ new Set([
    "Added to the end of the prompt:",
    "Added to the beginning of the UC:"
  ]);
  var PROMPT_CHUNKS_TAB_LABELS = {
    chunks: /* @__PURE__ */ new Set(["Prompt Chunks", "提示词片段"]),
    settings: /* @__PURE__ */ new Set(["Settings", "设置"])
  };
  var PROMPT_CHUNKS_CONTROL_LABELS = [
    "Add Prompt Chunk",
    "添加提示词片段",
    "Disable Tag Suggestions",
    "禁用标签建议",
    "Highlight Emphasis",
    "高亮强调语法",
    "Delete All",
    "全部删除"
  ];
  var CHARACTER_GENDER_LABELS = {
    female: /* @__PURE__ */ new Set(["Female", "女性"]),
    male: /* @__PURE__ */ new Set(["Male", "男性"]),
    other: /* @__PURE__ */ new Set(["Other", "其他"])
  };
  var allowedComboboxLabels = /* @__PURE__ */ new Set([
    "Select the Model",
    "Quality Preset",
    "Undesired Content Preset",
    "Select a Resolution Category",
    "Select a sampler",
    "选择模型",
    "质量预设",
    "负面内容预设",
    "选择分辨率类别",
    "选择采样器"
  ]);
  var PROMPT_CLASS_PATTERN = /(?:^|[-_])(prompt-input-box|prompt-suggestion|prompt-autocomplete|tag-suggestion)(?:$|[-_])/i;
  function classNames(element) {
    return typeof element.className === "string" ? element.className.split(/\s+/) : [];
  }
  function isPromptChunksTabBar(element) {
    if (element.children.length !== 2) {
      return false;
    }
    const labels = Array.from(element.children).map((child) => child.textContent?.trim() ?? "");
    return labels.some((label) => PROMPT_CHUNKS_TAB_LABELS.chunks.has(label)) && labels.some((label) => PROMPT_CHUNKS_TAB_LABELS.settings.has(label));
  }
  function looksLikeCharacterGenderMenu(element) {
    if (element === element.ownerDocument.body || element === element.ownerDocument.documentElement) {
      return false;
    }
    const descendants = Array.from(element.querySelectorAll("*"));
    if (descendants.length > 15) {
      return false;
    }
    const labels = descendants.filter((child) => child.children.length === 0).map((child) => child.textContent?.trim() ?? "");
    const nonemptyLabels = labels.filter(Boolean);
    return nonemptyLabels.length === 3 && labels.some((label) => CHARACTER_GENDER_LABELS.female.has(label)) && labels.some((label) => CHARACTER_GENDER_LABELS.male.has(label)) && labels.some((label) => CHARACTER_GENDER_LABELS.other.has(label));
  }
  function isCharacterGenderOption(node) {
    let current = node.parentElement;
    for (let depth = 0; current && depth < 5; depth += 1) {
      if (looksLikeCharacterGenderMenu(current)) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }
  function looksLikePromptChunksPanel(element) {
    const hasTabBar = Array.from(element.querySelectorAll("div")).some(isPromptChunksTabBar);
    if (!hasTabBar) {
      return false;
    }
    const hasControl = PROMPT_CHUNKS_CONTROL_LABELS.some(
      (label) => element.querySelector(`[aria-label="${label}"]`) || Array.from(element.querySelectorAll("button")).some(
        (button) => button.textContent?.trim() === label
      )
    );
    return Boolean(hasControl);
  }
  function promptChunksPanel(node) {
    let current = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    while (current) {
      if (looksLikePromptChunksPanel(current)) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }
  function isInsidePromptChunksPanel(node) {
    return Boolean(promptChunksPanel(node));
  }
  function isPromptChunksChromeText(node, source) {
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
        const headings = Array.from(panel.querySelectorAll("*")).filter((element) => PROMPT_CHUNKS_TAB_LABELS.chunks.has(element.textContent?.trim() ?? "")).filter((element) => element.children.length === 0).filter(
          (element) => !element.parentElement || !isPromptChunksTabBar(element.parentElement)
        );
        return headings[0] === parent;
      }
    }
    return false;
  }
  function isPromptEditorElement(element) {
    if (element.matches(
      '.ProseMirror, textarea, [contenteditable="true"], [data-prompt], [data-testid*="prompt" i]'
    )) {
      return true;
    }
    return classNames(element).some((name) => PROMPT_CLASS_PATTERN.test(name));
  }
  function isInsidePromptEditor(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return Boolean(element?.closest('.ProseMirror, textarea, [contenteditable="true"], [data-prompt]')) || hasPromptClassAncestor(element);
  }
  function hasPromptClassAncestor(element) {
    let current = element;
    while (current) {
      if (isPromptEditorElement(current)) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }
  function isInsideResultStage(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return Boolean(element?.closest(".image-gen-results-stage"));
  }
  function isInsideHistory(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    let current = element;
    while (current) {
      if (classNames(current).some((name) => /history/i.test(name))) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }
  function isPromptPreviewText(node) {
    const parent = node.parentElement;
    const container = parent?.parentElement;
    if (!parent || !container || parent.tagName !== "P") {
      return false;
    }
    return Array.from(container.children).some(
      (child) => child !== parent && PROMPT_PREVIEW_MARKERS.has(child.textContent?.trim() ?? "")
    );
  }
  function isAllowedSelectText(node) {
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
    return active instanceof HTMLInputElement && active.getAttribute("role") === "combobox" && active.getAttribute("aria-expanded") === "true" && allowedComboboxLabels.has(active.getAttribute("aria-label") ?? "");
  }
  function shouldSkipElement(element) {
    return element.matches("script, style, noscript, template") || isPromptEditorElement(element);
  }
  function canTranslateAttribute(element, name) {
    if (name !== "aria-label" && name !== "placeholder" && name !== "title") {
      return false;
    }
    if (element instanceof HTMLImageElement || isInsidePromptEditor(element)) {
      return false;
    }
    return true;
  }

  // src/translations.ts
  var entries = (values) => new Map(values);
  var text = entries([
    ["Model", "模型"],
    ["Mode", "模式"],
    ["Anime", "动漫"],
    ["Furry", "兽人"],
    ["Prompt", "提示词"],
    ["Prompt Chunks", "提示词片段"],
    ["Add Character", "添加角色"],
    ["AI Settings", "AI 设置"],
    ["Prompt Guidance", "提示词引导"],
    ["Advanced Settings", "高级设置"],
    ["Prompt Guidance Rescale", "提示词引导重缩放"],
    ["Randomize", "随机化"],
    ["Transparent BG", "透明背景"],
    ["Undesired Content", "不希望出现的内容"],
    ["Character Prompts", "角色提示词"],
    ["Create a separate prompt for characters in your scene.", "为场景中的角色创建单独的提示词。"],
    ["Reference Images", "参考图像"],
    ["Image2Image", "图生图"],
    ["Transform your image.", "转换你的图像。"],
    ["Image Settings", "图像设置"],
    ["Resolution", "分辨率"],
    ["Number of Images", "图像数量"],
    ["Steps", "步数"],
    ["Guidance", "提示词引导"],
    ["Seed", "种子"],
    ["Sampler", "采样器"],
    ["Quality Tags: Standard", "质量标签：标准"],
    ["Quality Tags: Light", "质量标签：轻度"],
    ["Quality Tags: None", "质量标签：无"],
    ["UC Preset: Heavy", "负面内容预设：严格"],
    ["UC Preset: Light", "负面内容预设：轻度"],
    ["UC Preset: Furry Focus", "负面内容预设：兽人重点"],
    ["UC Preset: Human Focus", "负面内容预设：人物重点"],
    ["UC Preset: None", "负面内容预设：无"],
    ['Adds "transparent background" to the prompt.', "向提示词添加“transparent background”。"],
    ["Added to the end of the prompt:", "添加到提示词末尾："],
    ["Added to the beginning of the UC:", "添加到负面内容开头："],
    ["Quick Start Gallery", "快速开始图库"],
    ["Director Tools", "导演工具"],
    ["Opus Usage Limit", "Opus 使用限额"],
    ["Explore", "探索图库"],
    ["Tutorial", "教程"],
    ["Remove BG", "移除背景"],
    ["Line Art", "线稿"],
    ["Sketch", "草图"],
    ["Colorize", "上色"],
    ["Emotion", "表情"],
    ["Declutter", "简化画面"],
    ["Transform", "转换"],
    ["Invalid", "无效"],
    ["Upload Image", "上传图像"],
    ["Select Image", "选择图像"],
    ["Add Image", "添加图像"],
    ["Strength", "强度"],
    ["Information Extracted", "提取的信息"],
    ["Precise Reference", "精确参考"],
    ["Style Aware", "感知风格"],
    ["Character Aware", "感知角色"],
    ["Cancel", "取消"],
    ["Apply", "应用"],
    ["Close", "关闭"],
    ["Save", "保存"],
    ["Download", "下载"],
    ["Delete", "删除"],
    ["Copied!", "已复制！"],
    ["Loading...", "正在加载……"],
    ["Something went wrong.", "出现了问题。"],
    ["Try again", "重试"],
    [
      "Our newest model, trained on a curated subset of images. Recommended for streaming.",
      "最新模型，使用精选图像子集训练。推荐用于直播。"
    ],
    ["Our newest and best model.", "最新且效果最佳的模型。"],
    [
      "Our V4.5 model trained on a curated subset of images. No longer recommended for use.",
      "使用精选图像子集训练的 V4.5 模型，现已不再推荐使用。"
    ],
    ["Our V4.5 model. No longer recommended for use.", "V4.5 模型，现已不再推荐使用。"],
    [
      "Our V4 model trained on a curated subset of images. No longer recommended for use.",
      "使用精选图像子集训练的 V4 模型，现已不再推荐使用。"
    ],
    ["Our V4 model. No longer recommended for use.", "V4 模型，现已不再推荐使用。"],
    ["Our previous model. No longer recommended for use.", "旧版模型，现已不再推荐使用。"]
  ]);
  var resultText = entries([
    ["Get Started", "快速开始"],
    ["Get Inspiration from our quick start gallery!", "从快速开始图库中获取灵感！"],
    ["Click an image to copy the prompt.", "点击图像即可复制提示词。"],
    ["Copied!", "已复制！"]
  ]);
  var historyText = entries([
    ["History", "历史记录"],
    ["No images yet", "还没有图像"],
    ["Select All", "全选"],
    ["Deselect All", "取消全选"]
  ]);
  var characterGenderText = entries([
    ["Female", "女性"],
    ["Male", "男性"],
    ["Other", "其他"]
  ]);
  var promptChunksText = entries([
    ["Prompt Chunks", "提示词片段"],
    ["Settings", "设置"],
    ["No custom prompt chunks yet. Click + to add one.", "尚无自定义提示词片段。点击 + 添加。"],
    ["Delete All", "全部删除"],
    ["Disable Tag Suggestions", "禁用标签建议"],
    ["Highlight Emphasis", "高亮强调语法"]
  ]);
  var promptPreviewText = entries([
    ["Added to the end of the prompt:", "添加到提示词末尾："],
    ["Added to the beginning of the UC:", "添加到负面内容开头："]
  ]);
  var selectText = entries([
    ["New", "最新"],
    ["Legacy", "旧版"],
    ["Recommended", "推荐"],
    ["Other", "其他"],
    ["Standard", "标准"],
    ["Light", "轻度"],
    ["Heavy", "严格"],
    ["Furry Focus", "兽人重点"],
    ["Human Focus", "人物重点"],
    ["None", "无"],
    ["Normal", "常规"],
    ["Large", "大尺寸"],
    ["Wallpaper", "壁纸"],
    ["Small", "小尺寸"],
    ["Custom", "自定义"]
  ]);
  var attributes = entries([
    ["menu", "菜单"],
    ["Select the Model", "选择模型"],
    ["Quality Preset", "质量预设"],
    ["Undesired Content Preset", "负面内容预设"],
    ["Select a Resolution Category", "选择分辨率类别"],
    ["Select a sampler", "选择采样器"],
    ["Swap width and height", "交换宽度和高度"],
    ["Use the seed of the displayed image", "使用当前显示图像的种子"],
    ["open History", "打开历史记录"],
    ["collapse History", "收起历史记录"],
    ["Add Category", "添加分类"],
    ["Add Prompt Chunk", "添加提示词片段"],
    ["Disable Tag Suggestions", "禁用标签建议"],
    ["Highlight Emphasis", "高亮强调语法"],
    ["Enter a seed", "输入种子"],
    ["reset settings", "重置设置"],
    ["choose image", "选择图像"],
    ["lock history scrolling", "锁定历史记录滚动"],
    ["unlock history scrolling", "解锁历史记录滚动"],
    ["download all images", "下载全部图像"],
    ["delete image(s)", "删除图像"],
    ["deselect image", "取消选择图像"],
    [
      "You are currently using Anime mode. The mode changes the tag suggestions and adds a dataset tag to the prompt. You can click the icon to switch.",
      "当前使用动漫模式。此模式会调整标签建议，并向提示词添加数据集标签。点击图标可切换模式。"
    ],
    [
      "You are currently using Furry mode. The mode changes the tag suggestions and adds a dataset tag to the prompt. You can click the icon to switch.",
      "当前使用兽人模式。此模式会调整标签建议，并向提示词添加数据集标签。点击图标可切换模式。"
    ]
  ]);
  var dynamicText = [
    {
      pattern: /^This prompt is using (\d+) of the currently used\s+(\d+) tokens\. Max total tokens: (\d+)$/,
      translate: (match) => `此提示词使用 ${match[1]} 个 token；当前已使用 ${match[2]} 个。token 总上限：${match[3]}`
    },
    {
      pattern: /^Generate (\d+) Image$/,
      translate: (match) => `生成 ${match[1]} 张图像`
    },
    {
      pattern: /^Generate (\d+) Images$/,
      translate: (match) => `生成 ${match[1]} 张图像`
    }
  ];
  var dynamicAttributes = [
    {
      pattern: /^Generate (\d+) Images? ?(\d+)? Anlas$/,
      translate: (match) => `生成 ${match[1]} 张图像${match[2] ? ` ${match[2]}` : ""} Anlas`
    },
    {
      pattern: /^Transform (Invalid|\d+) Anlas$/,
      translate: (match) => `转换 ${match[1] === "Invalid" ? "无效" : match[1]} Anlas`
    }
  ];
  var catalog = {
    text,
    resultText,
    historyText,
    characterGenderText,
    promptChunksText,
    promptPreviewText,
    selectText,
    attributes,
    dynamicText,
    dynamicAttributes
  };

  // src/translator.ts
  var translatableAttributes = [
    "aria-label",
    "placeholder",
    "title"
  ];
  function preserveWhitespace(original, translated) {
    const leading = original.match(/^\s*/)?.[0] ?? "";
    const trailing = original.match(/\s*$/)?.[0] ?? "";
    return `${leading}${translated}${trailing}`;
  }
  function translateDynamic(value, rules) {
    for (const rule of rules) {
      const match = value.match(rule.pattern);
      if (match) {
        return rule.translate(match);
      }
    }
    return void 0;
  }
  var UiTranslator = class {
    constructor(document2, catalog2 = catalog) {
      this.document = document2;
      this.catalog = catalog2;
      this.pendingNodes = /* @__PURE__ */ new Set();
      this.flushScheduled = false;
    }
    start() {
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
        attributeFilter: [...translatableAttributes]
      });
      if (this.document.documentElement) {
        this.translateSubtree(this.document.documentElement);
      }
    }
    stop() {
      this.observer?.disconnect();
      this.observer = void 0;
      this.pendingNodes.clear();
      this.flushScheduled = false;
    }
    translateSubtree(root) {
      const stack = [root];
      while (stack.length > 0) {
        const node = stack.pop();
        if (!node) {
          continue;
        }
        if (node.nodeType === Node.TEXT_NODE) {
          this.translateTextNode(node);
          continue;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node;
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
    translateTextNode(node) {
      if (isInsidePromptEditor(node)) {
        return;
      }
      const original = node.nodeValue ?? "";
      const source = original.trim();
      if (!source) {
        return;
      }
      let translated;
      if (isCharacterGenderOption(node)) {
        translated = this.catalog.characterGenderText.get(source);
      } else if (isInsidePromptChunksPanel(node)) {
        translated = isPromptChunksChromeText(node, source) ? this.catalog.promptChunksText.get(source) : void 0;
      } else if (isPromptPreviewText(node)) {
        translated = this.catalog.promptPreviewText.get(source);
      } else if (isInsideResultStage(node)) {
        translated = this.catalog.resultText.get(source);
      } else if (isInsideHistory(node)) {
        translated = this.catalog.historyText.get(source);
      } else if (isAllowedSelectText(node)) {
        translated = this.catalog.selectText.get(source) ?? this.catalog.text.get(source);
      } else {
        translated = this.catalog.text.get(source) ?? translateDynamic(source, this.catalog.dynamicText);
      }
      if (translated && translated !== source) {
        node.nodeValue = preserveWhitespace(original, translated);
      }
    }
    translateAttributes(element) {
      for (const attribute of translatableAttributes) {
        if (!canTranslateAttribute(element, attribute)) {
          continue;
        }
        const source = element.getAttribute(attribute);
        if (!source) {
          continue;
        }
        const translated = this.catalog.attributes.get(source) ?? translateDynamic(source, this.catalog.dynamicAttributes);
        if (translated && translated !== source) {
          element.setAttribute(attribute, translated);
        }
      }
    }
    scheduleFlush() {
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
  };

  // src/index.ts
  function isImageGenerationPage(location) {
    return location.hostname === "novelai.net" && location.pathname.startsWith("/image");
  }
  if (isImageGenerationPage(window.location)) {
    new UiTranslator(document).start();
  }
})();
