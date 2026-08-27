import type { DynamicTranslation, TranslationCatalog } from "./types";

const entries = <T extends readonly (readonly [string, string])[]>(values: T) => new Map(values);

const text = entries([
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
    "最新模型，使用精选图像子集训练。推荐用于直播。",
  ],
  ["Our newest and best model.", "最新且效果最佳的模型。"],
  [
    "Our V4.5 model trained on a curated subset of images. No longer recommended for use.",
    "使用精选图像子集训练的 V4.5 模型，现已不再推荐使用。",
  ],
  ["Our V4.5 model. No longer recommended for use.", "V4.5 模型，现已不再推荐使用。"],
  [
    "Our V4 model trained on a curated subset of images. No longer recommended for use.",
    "使用精选图像子集训练的 V4 模型，现已不再推荐使用。",
  ],
  ["Our V4 model. No longer recommended for use.", "V4 模型，现已不再推荐使用。"],
  ["Our previous model. No longer recommended for use.", "旧版模型，现已不再推荐使用。"],
] as const);

const resultText = entries([
  ["Get Started", "快速开始"],
  ["Get Inspiration from our quick start gallery!", "从快速开始图库中获取灵感！"],
  ["Click an image to copy the prompt.", "点击图像即可复制提示词。"],
  ["Copied!", "已复制！"],
] as const);

const historyText = entries([
  ["History", "历史记录"],
  ["No images yet", "还没有图像"],
  ["Select All", "全选"],
  ["Deselect All", "取消全选"],
] as const);

const characterGenderText = entries([
  ["Female", "女性"],
  ["Male", "男性"],
  ["Other", "其他"],
] as const);

const promptChunksText = entries([
  ["Prompt Chunks", "提示词片段"],
  ["Settings", "设置"],
  ["No custom prompt chunks yet. Click + to add one.", "尚无自定义提示词片段。点击 + 添加。"],
  ["Delete All", "全部删除"],
  ["Disable Tag Suggestions", "禁用标签建议"],
  ["Highlight Emphasis", "高亮强调语法"],
] as const);

const promptPreviewText = entries([
  ["Added to the end of the prompt:", "添加到提示词末尾："],
  ["Added to the beginning of the UC:", "添加到负面内容开头："],
] as const);

const selectText = entries([
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
  ["Custom", "自定义"],
] as const);

const attributes = entries([
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
    "当前使用动漫模式。此模式会调整标签建议，并向提示词添加数据集标签。点击图标可切换模式。",
  ],
  [
    "You are currently using Furry mode. The mode changes the tag suggestions and adds a dataset tag to the prompt. You can click the icon to switch.",
    "当前使用兽人模式。此模式会调整标签建议，并向提示词添加数据集标签。点击图标可切换模式。",
  ],
] as const);

const dynamicText: readonly DynamicTranslation[] = [
  {
    pattern:
      /^This prompt is using (\d+) of the currently used\s+(\d+) tokens\. Max total tokens: (\d+)$/,
    translate: (match) =>
      `此提示词使用 ${match[1]} 个 token；当前已使用 ${match[2]} 个。token 总上限：${match[3]}`,
  },
  {
    pattern: /^Generate (\d+) Image$/,
    translate: (match) => `生成 ${match[1]} 张图像`,
  },
  {
    pattern: /^Generate (\d+) Images$/,
    translate: (match) => `生成 ${match[1]} 张图像`,
  },
];

const dynamicAttributes: readonly DynamicTranslation[] = [
  {
    pattern: /^Generate (\d+) Images? ?(\d+)? Anlas$/,
    translate: (match) => `生成 ${match[1]} 张图像${match[2] ? ` ${match[2]}` : ""} Anlas`,
  },
  {
    pattern: /^Transform (Invalid|\d+) Anlas$/,
    translate: (match) => `转换 ${match[1] === "Invalid" ? "无效" : match[1]} Anlas`,
  },
];

export const catalog: TranslationCatalog = {
  text,
  resultText,
  historyText,
  characterGenderText,
  promptChunksText,
  promptPreviewText,
  selectText,
  attributes,
  dynamicText,
  dynamicAttributes,
};
