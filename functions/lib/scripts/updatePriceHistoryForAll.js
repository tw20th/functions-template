"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePriceHistoryForAll = void 0;
require("dotenv/config"); // ✅ ローカル開発用
const firebaseAdmin_1 = require("../lib/firebaseAdmin"); // ✅ 共通のFirestoreインスタンス取得
const updatePriceHistoryForAll = async () => {
    var _a, _b;
    const snapshot = await firebaseAdmin_1.db.collection("monitoredItems").get();
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
            console.log(`✅ ${doc.id}: priceHistory に追加`);
        }
        else {
            console.log(`⏭️ ${doc.id}: 既に同一日付＋価格あり`);
        }
    }
};
exports.updatePriceHistoryForAll = updatePriceHistoryForAll;
if (require.main === module) {
    (0, exports.updatePriceHistoryForAll)().catch(err => {
        console.error("❌ エラー:", err);
        process.exit(1);
    });
}
//# sourceMappingURL=updatePriceHistoryForAll.js.map