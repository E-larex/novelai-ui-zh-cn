# NovelAI 图像界面简体中文

这是一个适用于 [NovelAI Image](https://novelai.net/image) 的油猴脚本，用于把图像生成工作区的固定界面文案翻译为简体中文。

> [!IMPORTANT]
> 脚本绝不翻译、改写或规范化提示词。正面提示词、负面提示词、角色提示词、标签建议、预设中的标签串、历史记录和图像元数据都会保持原样。

## 功能范围

- 翻译图像生成主面板、图像设置、下拉选项、按钮和工具提示。
- 翻译 Quick Start Gallery、Director Tools、图像历史及相关通知。
- 保留模型名称、采样器名称、`NovelAI`、`Anlas`、`Opus` 等专有名称。
- 使用离线人工词库，不调用外部翻译服务，也不会发送页面数据。
- 对 NovelAI 新增而尚未登记的文案保持英文，避免误改提示词。

账户设置、文本生成、Tokenizer 和外部文档不属于本项目的翻译范围。

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)。
2. 打开[用户脚本安装地址](https://raw.githubusercontent.com/E-larex/novelai-ui-zh-cn/main/dist/novelai-ui-zh-cn.user.js)。
3. 在脚本管理器中确认安装，然后打开或刷新 [NovelAI Image](https://novelai.net/image)。

脚本使用 SemVer 版本号。脚本管理器会通过 GitHub `main` 分支上的固定 Raw 地址检查更新。

## 提示词保护

翻译器只处理人工登记的文本节点以及白名单中的 `aria-label` 和 `title`。以下内容受到显式保护：

- `.ProseMirror`、可编辑区域以及所有提示词输入容器；
- 正面、负面和角色提示词；
- 标签补全、提示词预览、预设模板和复制内容；
- 历史记录与生成结果中的提示词、图片 `alt` 和数据属性；
- 输入框的值及所有未知或有歧义的英文文本。

即使提示词刚好是 `Model`、`Normal` 或其他界面词汇，也不会被翻译。

## 本地开发

需要 Node.js 20 或更高版本。

```bash
make setup
make lint
make typecheck
make test
make build
```

正式构建文件位于 `dist/novelai-ui-zh-cn.user.js`，必须与源码一同提交。修改用户脚本时请同步更新 `package.json` 中的版本号并重新构建。

## 贡献

提交信息使用中文 Conventional Commits，例如：

```text
feat(translate): 添加图像设置界面翻译
fix(prompt): 修复提示词预览区域误匹配
docs(readme): 更新安装说明
```

涉及翻译行为的修改必须包含测试，尤其要证明提示词相关内容在翻译前后完全一致。

## 许可证与声明

本项目使用 [MIT License](LICENSE)。

本项目是社区维护的非官方工具，与 NovelAI 及其开发团队没有隶属、认可或合作关系。NovelAI 相关名称和商标归其各自权利人所有。
