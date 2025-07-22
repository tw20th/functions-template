import "dotenv/config";
import { db } from "../../lib/firebaseAdmin";
import { logger } from "../../lib/logger"; // ✅ 追加

export const updatePriceHistoryForAll = async (): Promise<void> => {
  const snapshot = await db.collection("monitoredItems").get();
  logger.info(`📦 取得した商品数: ${snapshot.size}`);

  const now = new Date();
  const today = now.toISOString().slice(0, 10); // "YYYY-MM-DD"

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const price = data.price ?? 0;
    const priceHistory: { date: string; price: number }[] = data.priceHistory ?? [];

    const alreadyExists = priceHistory.some(entry => {
      const entryDate = entry.date?.slice(0, 10);
      return entryDate === today && entry.price === price;
    });

    if (!alreadyExists) {
      const updatedHistory = [...priceHistory, { date: now.toISOString(), price }];
      await doc.ref.update({
        priceHistory: updatedHistory,
        updatedAt: now.toISOString(),
      });
      logger.success(`✅ ${doc.id}: priceHistory に追加`, { price });
    } else {
      logger.warn(`⏭️ ${doc.id}: 既に同一日付＋価格あり`);
    }
  }

  logger.info("🎉 価格履歴の更新が完了しました");
};

if (require.main === module) {
  updatePriceHistoryForAll().catch(err => {
    logger.error("❌ エラー:", err);
    process.exit(1);
  });
}
