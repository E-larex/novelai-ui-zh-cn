import { readFile } from "node:fs/promises";
import { build } from "esbuild";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

const downloadUrl =
  "https://raw.githubusercontent.com/E-larex/novelai-ui-zh-cn/main/dist/novelai-ui-zh-cn.user.js";

const metadata = `// ==UserScript==
// @name         NovelAI 图像界面简体中文
// @namespace    https://github.com/E-larex/novelai-ui-zh-cn
// @version      ${packageJson.version}
// @description  将 NovelAI 图像生成界面的固定文案翻译为简体中文，绝不修改提示词。
// @author       E-larex
// @license      MIT
// @homepageURL  https://github.com/E-larex/novelai-ui-zh-cn
// @supportURL   https://github.com/E-larex/novelai-ui-zh-cn/issues
// @updateURL    ${downloadUrl}
// @downloadURL  ${downloadUrl}
// @match        https://novelai.net/image*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==`;

await build({
  entryPoints: [new URL("../src/index.ts", import.meta.url).pathname],
  outfile: new URL("../dist/novelai-ui-zh-cn.user.js", import.meta.url).pathname,
  bundle: true,
  format: "iife",
  target: "es2020",
  platform: "browser",
  charset: "utf8",
  legalComments: "none",
  banner: { js: metadata },
});
