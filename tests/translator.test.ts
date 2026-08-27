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
