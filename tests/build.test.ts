import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const userscript = readFileSync(resolve(process.cwd(), "dist/novelai-ui-zh-cn.user.js"), "utf8");

describe("userscript build", () => {
  it("contains install and update metadata", () => {
    expect(userscript).toContain("// ==UserScript==");
    expect(userscript).toContain("// @version      0.1.0");
    expect(userscript).toContain("// @match        https://novelai.net/image*");
    expect(userscript).toContain("// @grant        none");
    expect(userscript).toContain(
      "// @updateURL    https://raw.githubusercontent.com/E-larex/novelai-ui-zh-cn/main/dist/novelai-ui-zh-cn.user.js",
    );
    expect(userscript).toContain(
      "// @downloadURL  https://raw.githubusercontent.com/E-larex/novelai-ui-zh-cn/main/dist/novelai-ui-zh-cn.user.js",
    );
  });

  it("does not contain remote translation or userscript APIs", () => {
    expect(userscript).not.toMatch(/fetch\s*\(/);
    expect(userscript).not.toMatch(/XMLHttpRequest/);
    expect(userscript).not.toMatch(/GM_[A-Za-z]+/);
  });
});
