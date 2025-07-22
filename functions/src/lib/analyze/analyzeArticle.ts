import { generateContentWithOpenAI } from "../openai";
import { loadPromptTemplate } from "../../utils/loadPromptTemplate";

type AnalyzeParams = {
  slug: string;
  content: string;
  promptType?: string;
};

const cleanJSON = (input: string): string => {
  // 1. ```json で囲まれている形式を優先的に抽出
  const fencedMatch = input.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  // 2. 単なる中括弧で囲まれたJSONらしき部分を抽出
  const braceMatch = input.match(/\{[\s\S]*?\}/);
  if (braceMatch) {
    return braceMatch[0].trim();
  }

  // 3. どちらも見つからなければ例外をスロー
  throw new Error("cleanJSON: JSON形式の部分が見つかりませんでした");
};

export const analyzeArticle = async ({ slug, content, promptType = "default" }: AnalyzeParams) => {
  const promptTemplate = loadPromptTemplate(promptType);
  const prompt = promptTemplate.replace("{{content}}", content);

  const result = await generateContentWithOpenAI({
    system: "あなたはSEOと読者心理に強いブログ分析アナリストです。",
    user: prompt,
  });

  try {
    const jsonString = cleanJSON(result);
    const parsed = JSON.parse(jsonString);

    // 例：基本的なバリデーション（scoreフィールドがあるか？）
    if (typeof parsed.score !== "number") {
      throw new Error("cleanJSON: JSONにはscoreフィールドが必要です");
    }

    return parsed;
  } catch (err) {
    console.error(`❌ JSON解析に失敗しました（slug: ${slug}）`, result, err);
    throw new Error("Invalid JSON from OpenAI");
  }
};
