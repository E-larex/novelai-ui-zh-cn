import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { UiTranslator } from "../src/translator";

async function flushMutations(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("UiTranslator", () => {
  let translator: UiTranslator;

  beforeEach(() => {
    document.documentElement.innerHTML = "<head></head><body></body>";
    translator = new UiTranslator(document);
  });

  afterEach(() => {
    translator.stop();
  });

  it("translates fixed UI text without replacing its element", () => {
    const button = document.createElement("button");
    const label = document.createTextNode("  Generate 1 Image  ");
    let clicks = 0;
    button.append(label);
    button.addEventListener("click", () => {
      clicks += 1;
    });
    document.body.append(button);

    translator.translateSubtree(document.body);
    button.click();

    expect(button.textContent).toBe("  生成 1 张图像  ");
    expect(clicks).toBe(1);
    expect(button.firstChild).toBe(label);
  });

  it("translates only allowlisted attributes and never changes values or image metadata", () => {
    document.body.innerHTML = `
      <button id="history" aria-label="collapse History" title="Swap width and height"></button>
      <button id="reset" aria-label="reset settings"></button>
      <input id="model-select" role="combobox" aria-label="Select the Model" value="Model">
      <input id="seed" placeholder="Enter a seed" value="123">
      <img id="result" alt="Model" title="Model" data-prompt="Model">
    `;

    translator.translateSubtree(document.body);

    expect(document.querySelector("#history")?.getAttribute("aria-label")).toBe("收起历史记录");
    expect(document.querySelector("#history")?.getAttribute("title")).toBe("交换宽度和高度");
    expect(document.querySelector("#reset")?.getAttribute("aria-label")).toBe("重置设置");
    expect(document.querySelector("#model-select")?.getAttribute("aria-label")).toBe("选择模型");
    expect((document.querySelector("#model-select") as HTMLInputElement).value).toBe("Model");
    expect(document.querySelector("#seed")?.getAttribute("placeholder")).toBe("输入种子");
    expect((document.querySelector("#seed") as HTMLInputElement).value).toBe("123");
    expect(document.querySelector("#result")?.getAttribute("alt")).toBe("Model");
    expect(document.querySelector("#result")?.getAttribute("title")).toBe("Model");
    expect(document.querySelector("#result")?.getAttribute("data-prompt")).toBe("Model");
  });

  it("preserves positive, negative, and character prompts byte-for-byte", () => {
    document.body.innerHTML = `
      <section class="prompt-input-box-prompt">
        <div class="ProseMirror" contenteditable="true"><p>Model <strong>Normal</strong>, {cat}</p></div>
      </section>
      <section class="prompt-input-box-undesired-content">
        <div class="ProseMirror" contenteditable="true"><p>Generate 1 Image, Standard</p></div>
      </section>
      <section class="prompt-input-box-character-1">
        <div class="ProseMirror" contenteditable="true"><p>Anime, [artist:name]</p></div>
      </section>
    `;
    const before = document.body.innerHTML;

    translator.translateSubtree(document.body);

    expect(document.body.innerHTML).toBe(before);
  });

  it("preserves prompt suggestions, prompt previews, and collision text", () => {
    document.body.innerHTML = `
      <div class="prompt-autocomplete-menu"><div role="option">Model</div></div>
      <div class="preset-tooltip">
        <p>Added to the end of the prompt:</p>
        <p>Normal</p>
      </div>
      <div data-prompt="saved"><span>Generate 1 Image</span></div>
    `;

    translator.translateSubtree(document.body);

    expect(document.querySelector(".prompt-autocomplete-menu")?.textContent).toBe("Model");
    const paragraphs = document.querySelectorAll(".preset-tooltip p");
    expect(paragraphs[0]?.textContent).toBe("添加到提示词末尾：");
    expect(paragraphs[1]?.textContent).toBe("Normal");
    expect(document.querySelector('[data-prompt="saved"]')?.textContent).toBe("Generate 1 Image");
  });

  it("uses restricted catalogs for result and history surfaces", () => {
    document.body.innerHTML = `
      <main class="image-gen-results-stage">
        <h1>Get Started</h1>
        <p>Model</p>
        <p>Click an image to copy the prompt.</p>
      </main>
      <aside class="image-history-panel">
        <h2>History</h2>
        <p>Model</p>
      </aside>
    `;

    translator.translateSubtree(document.body);

    expect(document.querySelector("main h1")?.textContent).toBe("快速开始");
    expect(document.querySelector("main p")?.textContent).toBe("Model");
    expect(document.querySelectorAll("main p")[1]?.textContent).toBe("点击图像即可复制提示词。");
    expect(document.querySelector("aside h2")?.textContent).toBe("历史记录");
    expect(document.querySelector("aside p")?.textContent).toBe("Model");
  });

  it("translates single-word values only in an allowed settings select", () => {
    document.body.innerHTML = `
      <div class="select">
        <div>Normal</div>
        <input role="combobox" aria-label="Select a Resolution Category">
      </div>
      <p id="free-text">Normal</p>
    `;

    translator.translateSubtree(document.body);

    expect(document.querySelector(".select div")?.textContent).toBe("常规");
    expect(document.querySelector("#free-text")?.textContent).toBe("Normal");
  });

  it("translates Prompt Chunks chrome while preserving custom chunk names", () => {
    document.body.innerHTML = `
      <section id="prompt-chunks-panel">
        <div class="tabs"><div>Prompt Chunks</div><div>Settings</div></div>
        <div class="content">
          <div class="heading"><span>Prompt Chunks</span></div>
          <button aria-label="Add Category"></button>
          <button aria-label="Add Prompt Chunk"></button>
          <p>No custom prompt chunks yet. Click + to add one.</p>
          <div class="custom-chunk">Settings</div>
          <div class="custom-chunk">Model</div>
          <button>Delete All</button>
        </div>
      </section>
    `;

    translator.translateSubtree(document.body);

    const tabs = document.querySelectorAll(".tabs div");
    expect(tabs[0]?.textContent).toBe("提示词片段");
    expect(tabs[1]?.textContent).toBe("设置");
    expect(document.querySelector(".heading")?.textContent).toBe("提示词片段");
    expect(document.querySelector(".content p")?.textContent).toBe(
      "尚无自定义提示词片段。点击 + 添加。",
    );
    expect(document.querySelectorAll(".custom-chunk")[0]?.textContent).toBe("Settings");
    expect(document.querySelectorAll(".custom-chunk")[1]?.textContent).toBe("Model");
    expect(document.querySelector("button[aria-label]")?.getAttribute("aria-label")).toBe(
      "添加分类",
    );
    expect(document.querySelector("button:last-child")?.textContent).toBe("全部删除");
  });

  it("translates Prompt Chunks settings without changing unknown panel content", () => {
    document.body.innerHTML = `
      <section>
        <div class="tabs"><div>Prompt Chunks</div><div>Settings</div></div>
        <div><label>Disable Tag Suggestions<input type="checkbox" aria-label="Disable Tag Suggestions"></label></div>
        <div><label>Highlight Emphasis<input type="checkbox" aria-label="Highlight Emphasis"></label></div>
        <p>Custom prompt chunk content</p>
      </section>
    `;

    translator.translateSubtree(document.body);

    expect(document.querySelectorAll("label")[0]?.textContent).toBe("禁用标签建议");
    expect(document.querySelectorAll("label")[1]?.textContent).toBe("高亮强调语法");
    expect(document.querySelector("p")?.textContent).toBe("Custom prompt chunk content");
  });

  it("translates character gender options only inside the gender menu", () => {
    document.body.innerHTML = `
      <div class="gender-menu">
        <div>Female</div>
        <div>Male</div>
        <div>Other</div>
      </div>
      <div id="global-menu">Other</div>
    `;

    translator.translateSubtree(document.body);

    expect(document.querySelector(".gender-menu")?.textContent?.replace(/\s+/g, "")).toBe(
      "女性男性其他",
    );
    expect(document.querySelector("#global-menu")?.textContent).toBe("Other");
  });

  it("translates advanced settings, tooltips, and dynamic token usage", () => {
    document.body.innerHTML = `
      <div>AI Settings</div>
      <div>Prompt Guidance</div>
      <div>Advanced Settings</div>
      <div>Prompt Guidance Rescale</div>
      <p>Add Character</p>
      <p>Randomize</p>
      <p id="tokens">This prompt is using 57 of the currently used\n0 tokens. Max total tokens: 703</p>
    `;

    translator.translateSubtree(document.body);

    expect(document.body.textContent).toContain("AI 设置");
    expect(document.body.textContent).toContain("提示词引导");
    expect(document.body.textContent).toContain("高级设置");
    expect(document.body.textContent).toContain("提示词引导重缩放");
    expect(document.body.textContent).toContain("添加角色");
    expect(document.body.textContent).toContain("随机化");
    expect(document.querySelector("#tokens")?.textContent).toBe(
      "此提示词使用 57 个 token；当前已使用 0 个。token 总上限：703",
    );
  });

  it("translates image import chrome while preserving imported metadata values", () => {
    document.body.innerHTML = `
      <div role="dialog" id="image-import">
        <h2>What do you want to do with this image?</h2>
        <button>Image2Image</button>
        <button>Vibe Transfer</button>
        <button>Precise Reference</button>
        <p>This image has metadata!</p>
        <p>Did you want to import that instead?</p>
        <label><input type="checkbox" aria-label="Prompt">Prompt</label>
        <label><input type="checkbox" aria-label="Undesired Content">Undesired Content</label>
        <label><input type="checkbox" aria-label="Characters">Characters</label>
        <label><input type="checkbox" aria-label="Append">Append</label>
        <label><input type="checkbox" aria-label="Settings">Settings</label>
        <label><input type="checkbox" aria-label="Seed">Seed</label>
        <button>Import Metadata</button>
        <label><input type="checkbox" aria-label="Clean Imports">Clean Imports</label>
        <section class="imported-metadata">
          <p>Settings</p>
          <p>Import Metadata</p>
          <img alt="Prompt" title="Settings" data-prompt="Characters">
        </section>
      </div>
    `;

    translator.translateSubtree(document.body);

    const dialog = document.querySelector("#image-import");
    expect(dialog?.querySelector("h2")?.textContent).toBe("你想如何使用这张图像？");
    expect([...dialog!.querySelectorAll("button")].map((button) => button.textContent)).toEqual([
      "图生图",
      "氛围迁移",
      "精确参考",
      "导入元数据",
    ]);
    expect([...dialog!.querySelectorAll("label")].map((label) => label.textContent)).toEqual([
      "提示词",
      "不希望出现的内容",
      "角色",
      "追加",
      "设置",
      "种子",
      "清理导入内容",
    ]);
    expect(
      [...dialog!.querySelectorAll("input")].map((input) => input.getAttribute("aria-label")),
    ).toEqual(["提示词", "不希望出现的内容", "角色", "追加", "设置", "种子", "清理导入内容"]);
    expect(
      dialog?.querySelector(".imported-metadata")?.textContent?.replace(/\s+/g, " ").trim(),
    ).toBe("Settings Import Metadata");
    const image = dialog?.querySelector("img");
    expect(image?.getAttribute("alt")).toBe("Prompt");
    expect(image?.getAttribute("title")).toBe("Settings");
    expect(image?.getAttribute("data-prompt")).toBe("Characters");
  });

  it("translates result actions, pin history, and import cleanup help", () => {
    document.body.innerHTML = `
      <p>Enhance</p>
      <p>Generate Variations</p>
      <p>Upscale</p>
      <p>Use as Base Image</p>
      <p>Edit Image</p>
      <p>Inpaint Image</p>
      <p>Send to Director Tools</p>
      <p>Pin Image</p>
      <p>Remove Pinned Image</p>
      <p>Copy to Clipboard</p>
      <p>Copy to Seed</p>
      <p>Download Image</p>
      <p>Remove [] / {}, add spaces after commas</p>
      <main class="image-gen-results-stage">
        <span>Copy to Seed</span>
        <span>Pin Image</span>
        <span>Model</span>
      </main>
      <aside class="image-history-panel"><button>Pins</button></aside>
    `;

    translator.translateSubtree(document.body);

    expect(document.body.textContent).toContain("增强");
    expect(document.body.textContent).toContain("生成变体");
    expect(document.body.textContent).toContain("放大");
    expect(document.body.textContent).toContain("用作基础图像");
    expect(document.body.textContent).toContain("编辑图像");
    expect(document.body.textContent).toContain("局部重绘图像");
    expect(document.body.textContent).toContain("发送到导演工具");
    expect(document.body.textContent).toContain("固定图像");
    expect(document.body.textContent).toContain("取消固定图像");
    expect(document.body.textContent).toContain("复制到剪贴板");
    expect(document.body.textContent).toContain("复制到种子");
    expect(document.body.textContent).toContain("下载图像");
    expect(document.body.textContent).toContain("移除 [] / {}，并在逗号后添加空格");
    expect(
      document.querySelector(".image-gen-results-stage")?.textContent?.replace(/\s+/g, ""),
    ).toBe("复制到种子固定图像Model");
    expect(document.querySelector(".image-history-panel button")?.textContent).toBe("已固定");
  });

  it("translates known image notifications and preserves unknown error details", async () => {
    translator.start();
    const notifications = document.createElement("section");
    notifications.className = "Toastify";
    notifications.innerHTML = `
      <div class="Toastify__toast"><p>Error</p></div>
      <div class="Toastify__toast"><p>Failed to pin image: storage unavailable</p></div>
      <div class="Toastify__toast"><p>Failed to copy image to clipboard.</p></div>
      <div class="Toastify__toast"><p>Failed to perform an unknown operation.</p></div>
    `;
    document.body.append(notifications);

    await flushMutations();

    const messages = [...notifications.querySelectorAll("p")].map((item) => item.textContent);
    expect(messages).toEqual([
      "错误",
      "固定图像失败：storage unavailable",
      "复制图像到剪贴板失败。",
      "Failed to perform an unknown operation.",
    ]);
  });

  it("translates dynamically added tooltips and notifications once", async () => {
    translator.start();
    const tooltip = document.createElement("p");
    tooltip.textContent = 'Adds "transparent background" to the prompt.';
    document.body.append(tooltip);

    await flushMutations();
    expect(tooltip.textContent).toBe("向提示词添加“transparent background”。");

    const unknown = document.createElement("p");
    unknown.textContent = "A newly released label";
    document.body.append(unknown);
    await flushMutations();
    expect(unknown.textContent).toBe("A newly released label");
  });
});
