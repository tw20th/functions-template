"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePriceHistoryForAll = void 0;
require("dotenv/config");
const firebaseAdmin_1 = require("../../lib/firebaseAdmin");
const logger_1 = require("../../lib/logger"); // ✅ 追加
const updatePriceHistoryForAll = async () => {
    var _a, _b;
    const snapshot = await firebaseAdmin_1.db.collection("monitoredItems").get();
    logger_1.logger.info(`📦 取得した商品数: ${snapshot.size}`);
    const now = new Date();
    const today = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
    for (const doc of snapshot.docs) {
        const data = doc.data();
        const price = (_a = data.price) !== null && _a !== void 0 ? _a : 0;
        const priceHistory = (_b = data.priceHistory) !== null && _b !== void 0 ? _b : [];
        const alreadyExists = priceHistory.some(entry => {
            var _a;
            const entryDate = (_a = entry.date) === null || _a === void 0 ? void 0 : _a.slice(0, 10);
            return entryDate === today && entry.price === price;
        });
        if (!alreadyExists) {
            const updatedHistory = [...priceHistory, { date: now.toISOString(), price }];
            await doc.ref.update({
                priceHistory: updatedHistory,
                updatedAt: now.toISOString(),
            });
            logger_1.logger.success(`✅ ${doc.id}: priceHistory に追加`, { price });
        }
        else {
            logger_1.logger.warn(`⏭️ ${doc.id}: 既に同一日付＋価格あり`);
        }
    }
    logger_1.logger.info("🎉 価格履歴の更新が完了しました");
};
exports.updatePriceHistoryForAll = updatePriceHistoryForAll;
if (require.main === module) {
    (0, exports.updatePriceHistoryForAll)().catch(err => {
        logger_1.logger.error("❌ エラー:", err);
        process.exit(1);
    });
}
//# sourceMappingURL=updatePriceHistoryForAll.js.map