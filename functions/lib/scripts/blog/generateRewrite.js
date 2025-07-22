"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRewrite = void 0;
const firebaseAdmin_1 = require("../../lib/firebaseAdmin");
const logger_1 = require("../../lib/logger"); // ✅ loggerを追加
const generateRewrite_1 = require("../../rewrite/generateRewrite");
const generateRewrite = async () => {
    const blogsSnapshot = await firebaseAdmin_1.db.collection("blogs").where("score", "<", 80).get();
    const lowScoreBlogs = blogsSnapshot.docs;
    logger_1.logger.info(`🔍 低スコア記事数: ${lowScoreBlogs.length}`);
    if (lowScoreBlogs.length === 0) {
        logger_1.logger.success("✅ リライト対象の記事はありません");
        return;
    }
    const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());
    const selected = shuffle(lowScoreBlogs).slice(0, Math.min(2, lowScoreBlogs.length));
    for (const blogDoc of selected) {
        const slug = blogDoc.id;
        const data = blogDoc.data();
        const { content, suggestedTitle, suggestedOutline, suggestedRewritePrompt, summary, productName, } = data;
        if (!content || !suggestedTitle || !suggestedOutline || !suggestedRewritePrompt || !summary) {
            logger_1.logger.warn(`⚠️ スキップ: ${slug} - 必要な分析データが不足`);
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
            logger_1.logger.success(`✏️ リライト完了: ${slug}`);
        }
        catch (error) {
            logger_1.logger.error(`❌ リライト失敗: ${slug}`, error);
        }
    }
    logger_1.logger.info("✨ リライト処理が完了しました");
};
exports.generateRewrite = generateRewrite;
//# sourceMappingURL=generateRewrite.js.map