"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillMissingSpecs = void 0;
require("dotenv/config"); // ✅ ローカル用 .env に対応
const firebaseAdmin_1 = require("../lib/firebaseAdmin"); // ✅ 共通の Firestore インスタンス
const extractSpecs_1 = require("../utils/extractSpecs");
// スペック補完処理
async function fillMissingSpecs() {
    const snapshot = await firebaseAdmin_1.db.collection("rakutenItems").get();
    for (const doc of snapshot.docs) {
        const data = doc.data();
        const { outputPower, capacity, weight, description, itemName } = data;
        const needsOutputPower = outputPower == null || outputPower === 0 || outputPower > 100;
        const needsCapacity = capacity == null || capacity === 0;
        const needsWeight = weight == null || weight === 0;
        if (!needsOutputPower && !needsCapacity && !needsWeight)
            continue;
        const sourceText = `${itemName !== null && itemName !== void 0 ? itemName : ""}\n${description !== null && description !== void 0 ? description : ""}`;
        const specs = (0, extractSpecs_1.extractSpecsFromText)(sourceText);
        const updateData = {};
        if (needsOutputPower && specs.outputPower != null)
            updateData.outputPower = specs.outputPower;
        if (needsCapacity && specs.capacity != null)
            updateData.capacity = specs.capacity;
        if (needsWeight && specs.weight != null)
            updateData.weight = specs.weight;
        if (Object.keys(updateData).length > 0) {
            await doc.ref.update(updateData);
            console.log(`✅ ${doc.id} を更新しました:`, updateData);
        }
    }
    console.log("🎉 スペック補完完了");
}
exports.fillMissingSpecs = fillMissingSpecs;
// 関数を即実行（CLIからの単体実行用）
if (require.main === module) {
    fillMissingSpecs().catch(err => {
        console.error("❌ エラー:", err);
        process.exit(1);
    });
}
//# sourceMappingURL=fillMissingSpecs.js.map