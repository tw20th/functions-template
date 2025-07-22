"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBlogFromItem = void 0;
const firebaseAdmin_1 = require("../lib/firebaseAdmin");
const openai_1 = require("../lib/openai");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const getRelatedBlogs_1 = require("../utils/getRelatedBlogs");
const generateInternalLinksMarkdown_1 = require("../utils/generateInternalLinksMarkdown");
const logger = __importStar(require("firebase-functions/logger")); // ✅ 追加
const loadTemplateForCategory = (category) => {
    const basePath = path.resolve(__dirname, "../prompts/blogTemplatePrompt");
    const safeCategory = category.replace(/[\\/:*?"<>|]/g, "");
    const candidates = [`blogTemplatePrompt_${safeCategory}.txt`, "blogTemplatePrompt_default.txt"];
    for (const file of candidates) {
        const fullPath = path.join(basePath, file);
        if (fs.existsSync(fullPath)) {
            return fs.readFileSync(fullPath, "utf-8");
        }
    }
    throw new Error(`テンプレートが見つかりませんでした: ${category}`);
};
const generateBlogFromItem = async (item) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    logger.log("🟡 投稿処理開始: ", { sourceItemCode: item.sourceItemCode });
    if (!item.productName || !item.sourceItemCode) {
        logger.error("❌ 必須フィールドが不足しています", { item });
        return;
    }
    const category = (_a = item.category) !== null && _a !== void 0 ? _a : "";
    logger.log("📁 カテゴリ: ", category);
    let template = "";
    try {
        template = loadTemplateForCategory(category);
        logger.log("✅ テンプレート読み込み成功");
    }
    catch (err) {
        logger.error("❌ テンプレート読み込み失敗", { category, error: err });
        return;
    }
    const promptType = decidePromptType(category);
    const prompt = template
        .replace("{{productName}}", item.productName)
        .replace("{{features}}", (_c = (_b = item.featureHighlights) === null || _b === void 0 ? void 0 : _b.join(" / ")) !== null && _c !== void 0 ? _c : "なし")
        .replace("{{price}}", (_e = (_d = item.price) === null || _d === void 0 ? void 0 : _d.toLocaleString()) !== null && _e !== void 0 ? _e : "不明");
    logger.log("🧠 ChatGPT入力プロンプト: ", prompt);
    let content = "";
    try {
        content = await (0, openai_1.generateContentWithOpenAI)({
            system: "あなたはSEOとUXに強い商品レビューブロガーです。",
            user: prompt,
        });
    }
    catch (err) {
        logger.error("❌ ChatGPT APIエラー", err);
        return;
    }
    if (!content) {
        logger.warn("❌ ChatGPTの出力が空です", { item });
        return;
    }
    logger.log("📝 ChatGPT出力あり、投稿処理へ進みます");
    const now = new Date();
    const slug = `${item.sourceItemCode}-${now.getTime()}`;
    const relatedBlogs = await (0, getRelatedBlogs_1.getRelatedBlogs)(slug, (_f = item.tags) !== null && _f !== void 0 ? _f : [], category);
    const internalLinksMarkdown = (0, generateInternalLinksMarkdown_1.generateInternalLinksMarkdown)(relatedBlogs);
    const finalContent = `${content.trim()}\n\n${internalLinksMarkdown.trim()}`;
    try {
        await firebaseAdmin_1.db
            .collection("blogs")
            .doc(slug)
            .set({
            slug,
            title: item.productName,
            tags: (_g = item.tags) !== null && _g !== void 0 ? _g : [],
            content: finalContent,
            category,
            promptType,
            image: (_h = item.imageUrl) !== null && _h !== void 0 ? _h : "",
            createdAt: now.toISOString(),
            sourceItemCode: item.sourceItemCode,
        });
        logger.log(`✅ ブログ生成完了 → /blogs/${slug}`);
    }
    catch (err) {
        logger.error("❌ Firestoreへの保存失敗", err);
    }
};
exports.generateBlogFromItem = generateBlogFromItem;
const decidePromptType = (category) => {
    if (category.includes("ストーリー") || category.includes("体験"))
        return "story";
    if (category.includes("価格") || category.includes("セール") || category.includes("お得"))
        return "sales";
    return "default";
};
//# sourceMappingURL=generateBlogFromItem.js.map