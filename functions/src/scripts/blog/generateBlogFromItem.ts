// functions/src/scripts/generateBlogFromItem.ts
import { db } from "../../lib/firebaseAdmin";
import { generateContentWithOpenAI } from "../../lib/openai";
import * as fs from "fs";
import * as path from "path";
import { getRelatedBlogs } from "../../utils/getRelatedBlogs";
import { generateInternalLinksMarkdown } from "../../utils/generateInternalLinksMarkdown";
import { MonitoredItem } from "../../types/blog";
import { logger } from "../../lib/logger"; // ✅ 差し替え

const loadTemplateForCategory = (category: string): string => {
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

export const generateBlogFromItem = async (item: MonitoredItem) => {
  logger.info("🟡 投稿処理開始", { sourceItemCode: item.sourceItemCode });

  if (!item.productName || !item.sourceItemCode) {
    logger.error("❌ 必須フィールドが不足しています", { item });
    return;
  }

  const category = item.category ?? "";
  let template = "";

  try {
    template = loadTemplateForCategory(category);
    logger.info("✅ テンプレート読み込み成功", { category });
  } catch (err) {
    logger.error("❌ テンプレート読み込み失敗", { category, error: err });
    return;
  }

  const promptType = decidePromptType(category);
  const prompt = template
    .replace("{{productName}}", item.productName)
    .replace("{{features}}", item.featureHighlights?.join(" / ") ?? "なし")
    .replace("{{price}}", item.price?.toLocaleString() ?? "不明");

  if (!prompt) {
    logger.warn("⚠️ 空のプロンプトが生成されました。処理スキップ", { item });
    return;
  }

  logger.debug("🧠 ChatGPT 入力プロンプト", prompt);

  let content = "";
  try {
    content = await generateContentWithOpenAI({
      system: "あなたはSEOとUXに強い商品レビューブロガーです。",
      user: prompt,
    });
  } catch (err) {
    logger.error("❌ ChatGPT APIエラー", err);
    return;
  }

  if (!content) {
    logger.warn("❌ ChatGPTの出力が空です", { item });
    return;
  }

  logger.success("📝 ChatGPT出力あり、投稿処理へ進みます");

  const now = new Date();
  const slug = `${item.sourceItemCode}-${now.getTime()}`;

  const relatedBlogs = await getRelatedBlogs(slug, item.tags ?? [], category);
  const internalLinksMarkdown = generateInternalLinksMarkdown(relatedBlogs);
  const finalContent = `${content.trim()}\n\n${internalLinksMarkdown.trim()}`;

  try {
    await db
      .collection("blogs")
      .doc(slug)
      .set({
        slug,
        title: item.productName,
        tags: item.tags ?? [],
        content: finalContent,
        category,
        promptType,
        image: item.imageUrl ?? "",
        createdAt: now.toISOString(),
        sourceItemCode: item.sourceItemCode,
        status: "draft", // ✅ 今後の下書き対応に備えて
      });

    logger.success(`✅ ブログ生成完了 → /blogs/${slug}`);
  } catch (err) {
    logger.error("❌ Firestoreへの保存失敗", err);
  }
};

const decidePromptType = (category: string): string => {
  if (category.includes("ストーリー") || category.includes("体験")) return "story";
  if (category.includes("価格") || category.includes("セール") || category.includes("お得"))
    return "sales";
  return "default";
};
