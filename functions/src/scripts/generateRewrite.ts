// functions/src/scripts/generateRewrite.ts

import { db } from "../lib/firebaseAdmin";
import { generateRewrite as generateRewriteFn } from "../rewrite/generateRewrite"; // ✅ 関数名を変更してインポート

export const generateRewrite = async () => {
  const blogsSnapshot = await db.collection("blogs").where("score", "<", 80).get();

  const lowScoreBlogs = blogsSnapshot.docs;

  if (lowScoreBlogs.length === 0) {
    console.log("✅ No low score blogs found.");
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
      console.warn(`⚠️ Skip ${slug}: missing required analysis data`);
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

      console.log(`✏️ Rewritten: ${slug}`);
    } catch (error) {
      console.error(`❌ Failed to rewrite ${slug}:`, error);
    }
  }

  console.log("✨ Rewrite process completed.");
};
