// functions/src/utils/loadPromptTemplate.ts
import fs from "fs";
import path from "path";

/**
 * 指定されたテンプレート名の Markdown テキストを読み込む
 * @param templateName 例: "default"
 * @returns テンプレート文字列
 */
export const loadPromptTemplate = (templateName: string): string => {
  const safeName = templateName.replace(/[\\/:*?"<>|]/g, "");

  // Cloud Functions 実行時の __dirname = lib/utils/ → ../../prompts で届く
  const basePath = path.resolve(__dirname, "../../prompts");
  const candidates = [path.join(basePath, `${safeName}.md`), path.join(basePath, "default.md")];

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return fs.readFileSync(file, "utf-8");
    }
  }

  throw new Error(`プロンプトテンプレートが見つかりませんでした: ${templateName}`);
};
