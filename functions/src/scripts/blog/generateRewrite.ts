import { db } from "../../lib/firebaseAdmin";
import { logger } from "../../lib/logger"; // ✅ loggerを追加
import { generateRewrite as generateRewriteFn } from "../../rewrite/generateRewrite";

export const generateRewrite = async () => {
  const blogsSnapshot = await db.collection("blogs").where("score", "<", 80).get();

  const lowScoreBlogs = blogsSnapshot.docs;
  logger.info(`🔍 低スコア記事数: ${lowScoreBlogs.length}`);

  if (lowScoreBlogs.length === 0) {
    logger.success("✅ リライト対象の記事はありません");
    return;
  }

  const shuffle = <T>(arr: T[]) => arr.sort(() => 0.5 - Math.random());
  const selected = shuffle(lowScoreBlogs).slice(0, Math.min(2, lowScoreBlogs.length));

  for (const blogDoc of selected) {
    const slug = blogDoc.id;
    const data = blogDoc.data();

    const {
      content,
      suggestedTitle,
      suggestedOutline,
      suggestedRewritePrompt,
      summary,
      productName,
    } = data;

    if (!content || !suggestedTitle || !suggestedOutline || !suggestedRewritePrompt || !summary) {
      logger.warn(`⚠️ スキップ: ${slug} - 必要な分析データが不足`);
      continue;
    }

    try {
      const rewritten = await generateRewriteFn({
        slug,
        originalContent: content,
        suggestedTitle,
        suggestedOutline,
        suggestedRewritePrompt,
        summary,
        productName,
      });

      await db.collection("blogs").doc(slug).update({
        content: rewritten,
        updatedAt: new Date().toISOString(),
        rewrittenByAi: true,
      });

      logger.success(`✏️ リライト完了: ${slug}`);
    } catch (error) {
      logger.error(`❌ リライト失敗: ${slug}`, error);
    }
  }

  logger.info("✨ リライト処理が完了しました");
};
