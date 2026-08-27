# Repository Guidelines

## Project Scope & Translation Boundaries

This project is a plugin for translating the user interface at `https://novelai.net/image`. Translate only interface chrome and fixed UI copy, such as navigation, buttons, section headings, setting labels, tooltips, dialogs, status messages, and validation or error messages.

Never translate, rewrite, normalize, annotate, or otherwise modify prompts or prompt-related content. This prohibition includes positive and negative prompts, user-entered text, generated or saved prompts, prompt history, prompt presets and templates, prompt examples, tags, tokens, embeddings, wildcards, syntax, autocomplete or suggestion entries, prompt metadata, and any text copied to or from prompt fields. Preserve such content byte-for-byte whenever the plugin observes, stores, or passes it through.

Treat ambiguous text as prompt-related and leave it unchanged. Translation selectors and DOM observers must explicitly exclude prompt inputs, prompt editors, prompt displays, and their related suggestion, history, preset, and metadata surfaces. Tests must verify both that intended interface text is translated and that all prompt-related content remains untouched.

## Project Structure & Module Organization

Keep production TypeScript under `src/`, automated tests under `tests/`, the build script under `scripts/`, and the installable userscript under `dist/`. The file `dist/novelai-ui-zh-cn.user.js` is generated but intentionally committed because GitHub Raw serves it as the stable install and update target. Keep configuration files at the repository root.

## Build, Test, and Development Commands

Dependencies are pinned in `package-lock.json`. Use the Make targets or their equivalent npm scripts:

- `make setup` — install dependencies with `npm ci`.
- `make build` — bundle the installable userscript into `dist/`.
- `make test` — run the Vitest suite in jsdom.
- `make lint` — run ESLint and verify Prettier formatting.
- `make typecheck` — run strict TypeScript checks without emitting files.
- `make check` — run lint, type checking, tests, and the production build.

Do not edit the generated userscript by hand. Change `src/`, update the SemVer version when publishing, rebuild, and commit the synchronized output.

## Coding Style & Naming Conventions

Use strict TypeScript, ESLint, and Prettier. Use `camelCase` for variables and functions, `PascalCase` for classes and interfaces, and descriptive lowercase names for modules. Keep DOM translation, protection logic, and the translation catalog separate. Never replace an element's full `textContent` when changing a text node would suffice.

## Testing Guidelines

Every behavior change must include a Vitest test or a brief explanation of why testing is impractical. Add regression tests for bug fixes. Translation tests must cover the intended UI text and verify serialized prompt-related DOM remains unchanged. Run `make check` before submitting changes.

## Commit & Pull Request Guidelines

Use Chinese Conventional Commit subjects, for example `feat(translate): 添加图像设置界面翻译`, and keep each commit logically focused. Pull requests should explain the problem and solution, list verification performed, and link relevant issues. Include screenshots or sample output for user-visible changes, and call out new configuration or breaking behavior.

## Security & Configuration

Never commit secrets, API keys, generated credentials, or local environment files. Provide sanitized examples such as `.env.example`, and document required variables without real values.
