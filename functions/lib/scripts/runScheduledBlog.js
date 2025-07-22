"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runScheduledBlog = void 0;
const firebaseAdmin_1 = require("../lib/firebaseAdmin");
const generateBlogFromItem_1 = require("./generateBlogFromItem");
const firebase_functions_1 = require("firebase-functions");
// ランダムに配列から N 個を選ぶユーティリティ
function pickRandom(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
const runScheduledBlog = async (limit = 1, timeSlot) => {
    firebase_functions_1.logger.log("⏰ scheduledBlog start");
    const snapshot = await firebaseAdmin_1.db.collection("monitoredItems").get();
    const allItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
    firebase_functions_1.logger.log(`🎯 monitoredItems total: ${allItems.length}`);
    // timeSlot フィルター & 必須フィールドありチェックのみ
    const targetItems = allItems.filter(item => {
        if (!item.affiliateUrl || !item.aiSummary || !item.productName)
            return false;
        if (timeSlot && item.timeSlot && item.timeSlot !== timeSlot)
            return false;
        return true;
    });
    firebase_functions_1.logger.log(`✅ filtered items (no duplicate filter): ${targetItems.length}`);
    const selectedItems = pickRandom(targetItems, limit);
    for (const item of selectedItems) {
        try {
            firebase_functions_1.logger.log(`📝 Generating blog for ${item.productName} (${item.sourceItemCode})`);
            await (0, generateBlogFromItem_1.generateBlogFromItem)(item);
        }
        catch (err) {
            firebase_functions_1.logger.error(`❌ Error generating blog for ${item.sourceItemCode}`, err);
        }
    }
    firebase_functions_1.logger.log("🏁 scheduledBlog end");
};
exports.runScheduledBlog = runScheduledBlog;
//# sourceMappingURL=runScheduledBlog.js.map