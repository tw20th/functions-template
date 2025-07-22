"use strict";
// functions/src/scripts/generateRewrite.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRewrite = void 0;
const firebaseAdmin_1 = require("../lib/firebaseAdmin");
const generateRewrite_1 = require("../rewrite/generateRewrite"); // ✅ 関数名を変更してインポート
const generateRewrite = async () => {
    const blogsSnapshot = await firebaseAdmin_1.db.collection("blogs").where("score", "<", 80).get();
    const lowScoreBlogs = blogsSnapshot.docs;
    if (lowScoreBlogs.length === 0) {
        console.log("✅ No low score blogs found.");
        return;
    }
    const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());
    const selected = shuffle(lowScoreBlogs).slice(0, Math.min(2, lowScoreBlogs.length));
    for (const blogDoc of selected) {
        const slug = blogDoc.id;
        const data = blogDoc.data();
        const { content, suggestedTitle, suggestedOutline, suggestedRewritePrompt, summary, productName, } = data;
        if (!content || !suggestedTitle || !suggestedOutline || !suggestedRewritePrompt || !summary) {
            console.warn(`⚠️ Skip ${slug}: missing required analysis data`);
            continue;
        }
        try {
            const rewritten = await (0, generateRewrite_1.generateRewrite)({
                slug,
                originalContent: content,
                suggestedTitle,
                suggestedOutline,
                suggestedRewritePrompt,
                summary,
                productName,
            });
            await firebaseAdmin_1.db.collection("blogs").doc(slug).update({
                content: rewritten,
                updatedAt: new Date().toISOString(),
                rewrittenByAi: true,
            });
            console.log(`✏️ Rewritten: ${slug}`);
        }
        catch (error) {
            console.error(`❌ Failed to rewrite ${slug}:`, error);
        }
    }
    console.log("✨ Rewrite process completed.");
};
exports.generateRewrite = generateRewrite;
//# sourceMappingURL=generateRewrite.js.map