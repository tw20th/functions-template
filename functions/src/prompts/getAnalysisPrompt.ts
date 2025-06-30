import fs from "fs/promises";
import path from "path";
import { PromptType } from "../types/promptType";

export const getAnalysisPrompt = async (
  content: string,
  promptType: PromptType = "default"
): Promise<string> => {
  const filePath = path.join(__dirname, "analyzePrompt", `${promptType}.txt`);

  const template = await fs.readFile(filePath, "utf-8");

  return template.replace("{{content}}", content);
};
