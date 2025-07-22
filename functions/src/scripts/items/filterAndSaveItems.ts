// functions/src/scripts/filterAndSaveItems.ts
import "dotenv/config";
import { db } from "../../lib/firebaseAdmin";
import { applyFilterRules } from "../../utils/filterUtils";
import { extractFeatures } from "../../utils/featureUtils";
import filterRules from "../../config/itemFilterRules.json";
import type { ItemFilterRule } from "../../types/itemFilterRule";
import { logger } from "../../lib/logger";

export const filterAndSaveItems = async (): Promise<void> => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const now = new Date();

    const snapshot = await db
      .collection("rakutenItems")
      .where("createdAt", ">=", startOfToday)
      .get();

    if (snapshot.empty) {
      logger.info("🔍 今日の新規 rakutenItems はありませんでした。処理スキップ。");
      return;
    }

    logger.info(`🧪 ${snapshot.docs.length} 件の rakutenItems をチェックします...`);

    const batch = db.batch();
    let processedCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const passedRule = applyFilterRules(data, filterRules as ItemFilterRule[]);
      if (!passedRule) continue;

      const featureHighlights = extractFeatures(data);
      const tags = passedRule.tags || [];

      const monitoredRef = db.collection("monitoredItems").doc(doc.id);
      const monitoredDoc = await monitoredRef.get();
      const previousData = monitoredDoc.exists ? monitoredDoc.data() : null;

      const rawHistory = previousData?.priceHistory ?? [];
      const priceHistory = rawHistory.filter(
        (entry: unknown): entry is { date: string; price: number } =>
          typeof entry === "object" && entry !== null && "date" in entry && "price" in entry
      );

      const newPrice = data.itemPrice ?? data.price ?? 0;
      const newEntry = {
        date: now.toISOString(),
        price: newPrice,
      };

      const today = now.toISOString().slice(0, 10);
      const alreadyExistsToday = priceHistory.some(
        (entry: { date: string; price: number }) =>
          entry.date.slice(0, 10) === today && entry.price === newPrice
      );

      if (!alreadyExistsToday) {
        priceHistory.push(newEntry);
      }

      batch.set(
        monitoredRef,
        {
          sourceItemCode: data.itemCode,
          productName: data.itemName,
          imageUrl: data.imageUrl,
          affiliateUrl: data.affiliateUrl ?? "",
          price: newPrice,
          priceHistory,
          tags,
          category: passedRule.label,
          featureHighlights,
          displayName: data.displayName ?? "",
          shortTitle: data.shortTitle ?? "",
          weight: data.weight ?? null,
          updatedAt: now.toISOString(),
        },
        { merge: true }
      );

      processedCount++;
    }

    await batch.commit();
    logger.success(`✅ monitoredItems に ${processedCount} 件保存完了！（merge & aiSummary維持）`);
  } catch (err) {
    logger.error("❌ filterAndSaveItems 実行中にエラー:", err);
    throw err;
  }
};

// CLI 実行用
if (require.main === module) {
  filterAndSaveItems().catch(e => {
    logger.error("❌ CLI実行時エラー:", e);
    process.exit(1);
  });
}
