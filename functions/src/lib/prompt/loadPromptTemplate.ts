import fs from "fs";
import path from "path";

/**
 * プロンプトテンプレートを読み込む関数
 * 実行時ディレクトリ：lib/analyze/
 * 探す場所：../../prompts/default.md → functions/prompts/
 */
export const loadPromptTemplate = (templateName: string): string => {
  const safeName = templateName.replace(/[\\/:*?"<>|]/g, "");

  const basePath = path.resolve(__dirname, "../../prompts"); // ← functions/prompts に届く
  const candidates = [path.join(basePath, `${safeName}.md`), path.join(basePath, "default.md")];

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return fs.readFileSync(file, "utf-8");
    }
  }

  throw new Error(`プロンプトテンプレートが見つかりませんでした: ${templateName}`);
};
