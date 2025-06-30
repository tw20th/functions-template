import { db } from "../lib/firebaseAdmin";
import { analyzeArticle } from "../analyze/analyzeArticle";

export const analyzeAllBlogs = async () => {
  const blogsSnapshot = await db.collection("blogs").get();

  for (const blogDoc of blogsSnapshot.docs) {
    const data = blogDoc.data();
    const slug = blogDoc.id;
    const content = data.content;

    if (!content) continue;

    // 👇 ここで promptType を取得（なければ "default" を使用）
    const promptType = data.promptType ?? "default";

    try {
      // 👇 promptType を analyzeArticle に渡す
      const result = await analyzeArticle({ slug, content, promptType });

      const prevHistory = data.analysisHistory ?? [];
      const newEntry = {
        score: result.score,
        suggestedTitle: result.suggestedTitle,
        summary: result.summary,
        updatedAt: new Date().toISOString(),
      };
      const updatedHistory = [...prevHistory, newEntry].slice(-10); // 最新10件だけ保持

      await db.collection("blogs").doc(slug).update({
        score: result.score,
        summary: result.summary,
        suggestedTitle: result.suggestedTitle,
        suggestedOutline: result.suggestedOutline,
        suggestedRewritePrompt: result.suggestedRewritePrompt,
        analysisHistory: updatedHistory,
      });

      console.log(`✅ analyzed: ${slug}`);
    } catch (error) {
      console.error(`❌ error analyzing ${slug}:`, error);
    }
  }
};

analyzeAllBlogs().then(() => {
  console.log("✨ All blog analysis done.");
});
