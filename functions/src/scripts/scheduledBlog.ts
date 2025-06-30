// functions/src/scripts/scheduledBlog.ts
import { onSchedule } from "firebase-functions/v2/scheduler";
import { db } from "../lib/firebaseAdmin";
import { generateBlogFromItem } from "../scripts/generateBlogFromItem";
import * as logger from "firebase-functions/logger";

// Firestoreの blogs にすでに存在する sourceItemCode を取得
const getPostedItemCodes = async (): Promise<string[]> => {
  const snapshot = await db.collection("blogs").get();
  return snapshot.docs.map((doc) => doc.data().sourceItemCode);
};

// スケジュール実行関数：毎日定時に2件投稿
export const scheduledBlog = onSchedule("every day 12:00", async () => {
  logger.log("⏰ scheduledBlog.ts started");

  const postedCodes = await getPostedItemCodes();

  // monitoredItems から未投稿の商品を最大2件取得（Firestoreの制限に対応）
  const snapshot = await db
    .collection("monitoredItems")
    .where("sourceItemCode", "not-in", postedCodes.slice(0, 10))
    .limit(2)
    .get();

  if (snapshot.empty) {
    logger.log("🚫 未投稿の商品が見つかりませんでした");
    return;
  }

  const items = snapshot.docs.map((doc) => doc.data());

  for (const item of items) {
    try {
      logger.log(
        `🟢 generate blog for: ${item.sourceItemCode} (category: ${item.category})`
      );
      // category は「悩みタグベース（例: 大容量モデル、軽量コンパクトなど）」
      await generateBlogFromItem(item);
    } catch (err) {
      logger.error("❌ Error generating blog", err);
    }
  }

  logger.log("✅ scheduledBlog.ts complete");
});
