import * as fs from "fs";
import * as path from "path";
import { generateContentWithOpenAI } from "../lib/openai";

type AnalyzeParams = {
  slug: string;
  content: string;
  promptType?: string; // 追加
};

// ✅ OpenAIのレスポンスから余計な記号を取り除く関数をここに追加
const cleanJSON = (input: string): string => {
  const match = input.match(/{[\s\S]*}/);
  if (match) {
    return match[0].trim();
  }
  throw new Error("JSON部分が見つかりませんでした");
};

export const analyzeArticle = async ({
  slug,
  content,
  promptType = "default", // デフォルト値を設定
}: AnalyzeParams) => {
  // プロンプトファイルを読み込む関数
  const loadPromptTemplate = (type: string): string => {
    const safeType = type.replace(/[\\/:*?"<>|]/g, "");
    const candidates = [
      path.resolve(__dirname, `../prompts/analyzePrompt/${safeType}.txt`),
      path.resolve(__dirname, "../prompts/analyzePrompt_default.txt"),
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf-8");
      }
    }

    throw new Error(`プロンプトテンプレートが見つかりませんでした: ${type}`);
  };

  const promptTemplate = loadPromptTemplate(promptType);
  const prompt = promptTemplate.replace("{{content}}", content);

  const result = await generateContentWithOpenAI({
    system: "あなたはSEOと読者心理に強いブログ分析アナリストです。",
    user: prompt,
  });

  try {
    const jsonString = cleanJSON(result); // 🛠️ 修正済み：extractJson → cleanJSON
    return JSON.parse(jsonString);
  } catch (err) {
    console.error(`❌ JSON解析に失敗しました（slug: ${slug}）`, result, err);
    throw new Error("Invalid JSON from OpenAI");
  }
};
