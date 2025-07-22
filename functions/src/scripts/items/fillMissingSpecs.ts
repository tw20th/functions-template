import "dotenv/config";
import { db } from "../../lib/firebaseAdmin";
import { extractSpecsFromText } from "../../utils/extractSpecs";
import { logger } from "../../lib/logger"; // ✅ logger を追加

// スペック補完処理
export async function fillMissingSpecs() {
  const snapshot = await db.collection("rakutenItems").get();
  logger.info(`📦 取得した商品数: ${snapshot.size}`);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const { outputPower, capacity, weight, description, itemName } = data;

    const needsOutputPower = outputPower == null || outputPower === 0 || outputPower > 100;
    const needsCapacity = capacity == null || capacity === 0;
    const needsWeight = weight == null || weight === 0;

    if (!needsOutputPower && !needsCapacity && !needsWeight) continue;

    const sourceText = `${itemName ?? ""}\n${description ?? ""}`;
    const specs = extractSpecsFromText(sourceText);

    const updateData: Record<string, number> = {};
    if (needsOutputPower && specs.outputPower != null) updateData.outputPower = specs.outputPower;
    if (needsCapacity && specs.capacity != null) updateData.capacity = specs.capacity;
    if (needsWeight && specs.weight != null) updateData.weight = specs.weight;

    if (Object.keys(updateData).length > 0) {
      await doc.ref.update(updateData);
      logger.success(`✅ ${doc.id} を更新しました`, updateData);
    } else {
      logger.warn(`⚠️ ${doc.id} に更新対象なし`);
    }
  }

  logger.info("🎉 スペック補完完了");
}

// 関数を即実行（CLIからの単体実行用）
if (require.main === module) {
  fillMissingSpecs().catch(err => {
    logger.error("❌ エラー:", err);
    process.exit(1);
  });
}
