import { db } from "../../lib/firebaseAdmin";
import { analyzeArticle } from "../../lib/analyze/analyzeArticle";
import { logger } from "firebase-functions";

export const analyzeAllBlogs = async () => {
  const blogsSnapshot = await db.collection("blogs").get();

  for (const blogDoc of blogsSnapshot.docs) {
    const data = blogDoc.data();
    const slug = blogDoc.id;
    const content = data.content;
    if (!content) continue;

    const promptType = data.promptType ?? "default";

    try {
      const result = await analyzeArticle({ slug, content, promptType });
      const prevHistory = data.analysisHistory ?? [];

      const newEntry: Record<string, unknown> = {
        score: result.score,
        updatedAt: new Date().toISOString(),
      };
      if (result.suggestedTitle !== undefined) newEntry.suggestedTitle = result.suggestedTitle;
      if (result.summary !== undefined) newEntry.summary = result.summary;

      const updatedHistory = [...prevHistory, newEntry].slice(-10); // 最新10件に制限

      const updateData: Record<string, unknown> = {
        analysisHistory: updatedHistory,
      };
      if (result.score !== undefined) updateData.score = result.score;
      if (result.summary !== undefined) updateData.summary = result.summary;
      if (result.suggestedTitle !== undefined) updateData.suggestedTitle = result.suggestedTitle;
      if (result.suggestedOutline !== undefined)
        updateData.suggestedOutline = result.suggestedOutline;
      if (result.suggestedRewritePrompt !== undefined)
        updateData.suggestedRewritePrompt = result.suggestedRewritePrompt;

      await db.collection("blogs").doc(slug).update(updateData);

      logger.info(`✅ analyzed: ${slug}`);
    } catch (error) {
      logger.error(`❌ error analyzing ${slug}:`, error);
    }
  }
};
