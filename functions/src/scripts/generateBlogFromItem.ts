import { db } from "../lib/firebaseAdmin";
import { generateContentWithOpenAI } from "../lib/openai";
import * as fs from "fs";
import * as path from "path";
import { getRelatedBlogs } from "../utils/getRelatedBlogs";
import { generateInternalLinksMarkdown } from "../utils/generateInternalLinksMarkdown";

const loadTemplateForCategory = (category: string): string => {
  const basePath = path.resolve(__dirname, "../prompts/blogTemplatePrompt");
  const safeCategory = category.replace(/[\\/:*?"<>|]/g, "");
  const candidates = [
    `blogTemplatePrompt_${safeCategory}.txt`,
    `blogTemplatePrompt_default.txt`,
  ];

  for (const file of candidates) {
    const fullPath = path.join(basePath, file);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, "utf-8");
    }
  }

  throw new Error(`テンプレートが見つかりませんでした: ${category}`);
};

export const generateBlogFromItem = async (item: any) => {
  if (!item.productName || !item.sourceItemCode) {
    console.log("❌ 必須フィールドが不足しています");
    return;
  }

  const category = item.category ?? "";
  const template = loadTemplateForCategory(category);
  const promptType = decidePromptType(category); // ← OK

  const prompt = template
    .replace("{{productName}}", item.productName)
    .replace("{{features}}", item.featureHighlights?.join(" / ") ?? "なし")
    .replace("{{price}}", item.price?.toLocaleString() ?? "不明");

  const content = await generateContentWithOpenAI({
    system: "あなたはSEOとUXに強い商品レビューブロガーです。",
    user: prompt,
  });

  if (!content) {
    console.log("❌ ChatGPTの出力が空です");
    return;
  }

  const now = new Date();
  const slug = `${item.sourceItemCode}-${now.getTime()}`;

  const relatedBlogs = await getRelatedBlogs(slug, item.tags ?? [], category);
  const internalLinksMarkdown = generateInternalLinksMarkdown(relatedBlogs);
  const finalContent = `${content.trim()}\n\n${internalLinksMarkdown.trim()}`;

  await db
    .collection("blogs")
    .doc(slug)
    .set({
      slug,
      title: item.productName,
      tags: item.tags ?? [],
      content: finalContent,
      category,
      promptType, // ← OK
      image: item.imageUrl ?? "",
      createdAt: now.toISOString(),
      sourceItemCode: item.sourceItemCode,
    });

  console.log(`✅ ブログ生成完了 → /blogs/${slug}`);
};

// ✅ この位置に出す
const decidePromptType = (category: string): string => {
  if (category.includes("ストーリー") || category.includes("体験")) {
    return "story";
  }
  if (
    category.includes("価格") ||
    category.includes("セール") ||
    category.includes("お得")
  ) {
    return "sales";
  }
  return "default";
};
