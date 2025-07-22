"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runScheduledBlog = void 0;
// functions/src/scripts/runScheduledBlog.ts
const firebaseAdmin_1 = require("../../lib/firebaseAdmin");
const generateBlogFromItem_1 = require("./generateBlogFromItem");
const logger_1 = require("../../lib/logger");
// ランダムに配列から N 件を選ぶ
function pickRandom(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
const runScheduledBlog = async (limit = 1, timeSlot) => {
    logger_1.logger.info("⏰ scheduledBlog 開始");
    const snapshot = await firebaseAdmin_1.db.collection("monitoredItems").get();
    const allItems = snapshot.docs.map(doc => {
        const data = doc.data(); // idだけ後付けする
        return {
            id: doc.id,
            ...data,
        };
    });
    logger_1.logger.debug(`📦 全 monitoredItems: ${allItems.length} 件`);
    const targetItems = allItems.filter(item => {
        const hasRequiredFields = item.affiliateUrl && item.aiSummary && item.productName;
        const matchesTimeSlot = !timeSlot || !item.timeSlot || item.timeSlot === timeSlot;
        return hasRequiredFields && matchesTimeSlot;
    });
    logger_1.logger.info(`🎯 条件に合致した商品数: ${targetItems.length}`);
    if (targetItems.length === 0) {
        logger_1.logger.warn("🟡 処理対象の商品がありませんでした");
        return;
    }
    const selectedItems = pickRandom(targetItems, limit);
    logger_1.logger.info(`✅ 今回生成対象の商品: ${selectedItems.length} 件`);
    for (const item of selectedItems) {
        try {
            logger_1.logger.info(`📝 ブログ生成開始: ${item.productName}（${item.sourceItemCode}）`);
            await (0, generateBlogFromItem_1.generateBlogFromItem)(item);
            logger_1.logger.success(`✅ ブログ生成完了: ${item.productName}（${item.sourceItemCode}）`);
        }
        catch (err) {
            logger_1.logger.error(`❌ ブログ生成エラー: ${item.productName}（${item.sourceItemCode}）`, err);
        }
    }
    logger_1.logger.info("🏁 scheduledBlog 終了");
};
exports.runScheduledBlog = runScheduledBlog;
//# sourceMappingURL=runScheduledBlog.js.map