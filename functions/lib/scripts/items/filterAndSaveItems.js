"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterAndSaveItems = void 0;
// functions/src/scripts/filterAndSaveItems.ts
require("dotenv/config");
const firebaseAdmin_1 = require("../../lib/firebaseAdmin");
const filterUtils_1 = require("../../utils/filterUtils");
const featureUtils_1 = require("../../utils/featureUtils");
const itemFilterRules_json_1 = __importDefault(require("../../config/itemFilterRules.json"));
const logger_1 = require("../../lib/logger");
const filterAndSaveItems = async () => {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const now = new Date();
        const snapshot = await firebaseAdmin_1.db
            .collection("rakutenItems")
            .where("createdAt", ">=", startOfToday)
            .get();
        if (snapshot.empty) {
            logger_1.logger.info("🔍 今日の新規 rakutenItems はありませんでした。処理スキップ。");
            return;
        }
        logger_1.logger.info(`🧪 ${snapshot.docs.length} 件の rakutenItems をチェックします...`);
        const batch = firebaseAdmin_1.db.batch();
        let processedCount = 0;
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const passedRule = (0, filterUtils_1.applyFilterRules)(data, itemFilterRules_json_1.default);
            if (!passedRule)
                continue;
            const featureHighlights = (0, featureUtils_1.extractFeatures)(data);
            const tags = passedRule.tags || [];
            const monitoredRef = firebaseAdmin_1.db.collection("monitoredItems").doc(doc.id);
            const monitoredDoc = await monitoredRef.get();
            const previousData = monitoredDoc.exists ? monitoredDoc.data() : null;
            const rawHistory = (_a = previousData === null || previousData === void 0 ? void 0 : previousData.priceHistory) !== null && _a !== void 0 ? _a : [];
            const priceHistory = rawHistory.filter((entry) => typeof entry === "object" && entry !== null && "date" in entry && "price" in entry);
            const newPrice = (_c = (_b = data.itemPrice) !== null && _b !== void 0 ? _b : data.price) !== null && _c !== void 0 ? _c : 0;
            const newEntry = {
                date: now.toISOString(),
                price: newPrice,
            };
            const today = now.toISOString().slice(0, 10);
            const alreadyExistsToday = priceHistory.some((entry) => entry.date.slice(0, 10) === today && entry.price === newPrice);
            if (!alreadyExistsToday) {
                priceHistory.push(newEntry);
            }
            batch.set(monitoredRef, {
                sourceItemCode: data.itemCode,
                productName: data.itemName,
                imageUrl: data.imageUrl,
                affiliateUrl: (_d = data.affiliateUrl) !== null && _d !== void 0 ? _d : "",
                price: newPrice,
                priceHistory,
                tags,
                category: passedRule.label,
                featureHighlights,
                displayName: (_e = data.displayName) !== null && _e !== void 0 ? _e : "",
                shortTitle: (_f = data.shortTitle) !== null && _f !== void 0 ? _f : "",
                weight: (_g = data.weight) !== null && _g !== void 0 ? _g : null,
                updatedAt: now.toISOString(),
            }, { merge: true });
            processedCount++;
        }
        await batch.commit();
        logger_1.logger.success(`✅ monitoredItems に ${processedCount} 件保存完了！（merge & aiSummary維持）`);
    }
    catch (err) {
        logger_1.logger.error("❌ filterAndSaveItems 実行中にエラー:", err);
        throw err;
    }
};
exports.filterAndSaveItems = filterAndSaveItems;
// CLI 実行用
if (require.main === module) {
    (0, exports.filterAndSaveItems)().catch(e => {
        logger_1.logger.error("❌ CLI実行時エラー:", e);
        process.exit(1);
    });
}
//# sourceMappingURL=filterAndSaveItems.js.map