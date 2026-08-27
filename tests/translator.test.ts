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
      <input id="model-select" role="combobox" aria-label="Select the Model" value="Model">
      <img id="result" alt="Model" title="Model" data-prompt="Model">
    `;

    translator.translateSubtree(document.body);

    expect(document.querySelector("#history")?.getAttribute("aria-label")).toBe("收起历史记录");
    expect(document.querySelector("#history")?.getAttribute("title")).toBe("交换宽度和高度");
    expect(document.querySelector("#model-select")?.getAttribute("aria-label")).toBe("选择模型");
    expect((document.querySelector("#model-select") as HTMLInputElement).value).toBe("Model");
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
