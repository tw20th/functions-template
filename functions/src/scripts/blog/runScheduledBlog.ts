// functions/src/scripts/runScheduledBlog.ts
import { db } from "../../lib/firebaseAdmin";
import { generateBlogFromItem } from "./generateBlogFromItem";
import { logger } from "../../lib/logger";
import { MonitoredItem } from "../../types/blog";

// ランダムに配列から N 件を選ぶ
function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export const runScheduledBlog = async (limit = 1, timeSlot?: "morning" | "noon") => {
  logger.info("⏰ scheduledBlog 開始");

  const snapshot = await db.collection("monitoredItems").get();
  const allItems: MonitoredItem[] = snapshot.docs.map(doc => {
    const data = doc.data() as Omit<MonitoredItem, "id">; // idだけ後付けする
    return {
      id: doc.id,
      ...data,
    };
  });

  logger.debug(`📦 全 monitoredItems: ${allItems.length} 件`);

  const targetItems = allItems.filter(item => {
    const hasRequiredFields = item.affiliateUrl && item.aiSummary && item.productName;
    const matchesTimeSlot = !timeSlot || !item.timeSlot || item.timeSlot === timeSlot;

    return hasRequiredFields && matchesTimeSlot;
  });

  logger.info(`🎯 条件に合致した商品数: ${targetItems.length}`);

  if (targetItems.length === 0) {
    logger.warn("🟡 処理対象の商品がありませんでした");
    return;
  }

  const selectedItems = pickRandom(targetItems, limit);
  logger.info(`✅ 今回生成対象の商品: ${selectedItems.length} 件`);

  for (const item of selectedItems) {
    try {
      logger.info(`📝 ブログ生成開始: ${item.productName}（${item.sourceItemCode}）`);
      await generateBlogFromItem(item);
      logger.success(`✅ ブログ生成完了: ${item.productName}（${item.sourceItemCode}）`);
    } catch (err) {
      logger.error(`❌ ブログ生成エラー: ${item.productName}（${item.sourceItemCode}）`, err);
    }
  }

  logger.info("🏁 scheduledBlog 終了");
};
