"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeAllBlogs = void 0;
const firebaseAdmin_1 = require("../../lib/firebaseAdmin");
const analyzeArticle_1 = require("../../lib/analyze/analyzeArticle");
const firebase_functions_1 = require("firebase-functions");
const analyzeAllBlogs = async () => {
    var _a, _b;
    const blogsSnapshot = await firebaseAdmin_1.db.collection("blogs").get();
    for (const blogDoc of blogsSnapshot.docs) {
        const data = blogDoc.data();
        const slug = blogDoc.id;
        const content = data.content;
        if (!content)
            continue;
        const promptType = (_a = data.promptType) !== null && _a !== void 0 ? _a : "default";
        try {
            const result = await (0, analyzeArticle_1.analyzeArticle)({ slug, content, promptType });
            const prevHistory = (_b = data.analysisHistory) !== null && _b !== void 0 ? _b : [];
            const newEntry = {
                score: result.score,
                updatedAt: new Date().toISOString(),
            };
            if (result.suggestedTitle !== undefined)
                newEntry.suggestedTitle = result.suggestedTitle;
            if (result.summary !== undefined)
                newEntry.summary = result.summary;
            const updatedHistory = [...prevHistory, newEntry].slice(-10); // 最新10件に制限
            const updateData = {
                analysisHistory: updatedHistory,
            };
            if (result.score !== undefined)
                updateData.score = result.score;
            if (result.summary !== undefined)
                updateData.summary = result.summary;
            if (result.suggestedTitle !== undefined)
                updateData.suggestedTitle = result.suggestedTitle;
            if (result.suggestedOutline !== undefined)
                updateData.suggestedOutline = result.suggestedOutline;
            if (result.suggestedRewritePrompt !== undefined)
                updateData.suggestedRewritePrompt = result.suggestedRewritePrompt;
            await firebaseAdmin_1.db.collection("blogs").doc(slug).update(updateData);
            firebase_functions_1.logger.info(`✅ analyzed: ${slug}`);
        }
        catch (error) {
            firebase_functions_1.logger.error(`❌ error analyzing ${slug}:`, error);
        }
    }
};
exports.analyzeAllBlogs = analyzeAllBlogs;
//# sourceMappingURL=analyzeAllBlogs.js.map