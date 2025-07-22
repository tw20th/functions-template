"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAiSummary = void 0;
// functions/src/scripts/generateAiSummary.ts
require("dotenv/config");
const firebaseAdmin_1 = require("../../lib/firebaseAdmin");
const openai_1 = require("openai");
const logger_1 = require("../../lib/logger");
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
const generateAiSummary = async () => {
    var _a, _b, _c;
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const snapshot = await firebaseAdmin_1.db
            .collection("monitoredItems")
            .where("updatedAt", ">=", startOfToday.toISOString())
            .get();
        if (snapshot.empty) {
            logger_1.logger.info("🟡 今日更新された monitoredItems はありませんでした");
            return;
        }
        const batch = firebaseAdmin_1.db.batch();
        let processedCount = 0;
        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.aiSummary)
                continue;
            const { displayName, featureHighlights = [], tags = [] } = data;
            const productName = displayName || data.productName || "この商品";
            const prompt = `次の特徴を持つモバイルバッテリー「${productName}」について、簡潔でわかりやすい魅力を説明してください。\n\n特徴:\n- ${featureHighlights.join("\n- ")}\n\nタグ: ${tags.join(", ")}\n\n要約:`;
            try {
                const completion = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "あなたはECサイト向けのマーケティングライターです。",
                        },
                        { role: "user", content: prompt },
                    ],
                    temperature: 0.7,
                });
                const aiSummary = (_c = (_b = (_a = completion.data.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
                if (!aiSummary) {
                    logger_1.logger.warn(`⚠️ 要約生成に失敗（空）: ${productName}`);
                    continue;
                }
                batch.update(doc.ref, { aiSummary });
                processedCount++;
            }
            catch (err) {
                logger_1.logger.error(`❌ OpenAIエラー: ${productName}`, err);
                continue; // この商品だけスキップ
            }
        }
        if (processedCount > 0) {
            await batch.commit();
            logger_1.logger.success(`✅ ${processedCount} 件の aiSummary を生成して保存しました`);
        }
        else {
            logger_1.logger.info("🟡 処理対象がありませんでした（すでに全て要約済み）");
        }
    }
    catch (err) {
        logger_1.logger.error("❌ generateAiSummary 実行時エラー:", err);
        throw err;
    }
};
exports.generateAiSummary = generateAiSummary;
// CLI 実行用
if (require.main === module) {
    (0, exports.generateAiSummary)().catch(err => {
        logger_1.logger.error("❌ CLI実行時エラー:", err);
        process.exit(1);
    });
}
//# sourceMappingURL=generateAiSummary.js.map