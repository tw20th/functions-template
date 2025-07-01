// functions/src/scripts/runScheduledBlog.ts
import { db } from "../lib/firebaseAdmin";
import { generateBlogFromItem } from "./generateBlogFromItem";
import * as logger from "firebase-functions/logger";

export const runScheduledBlog = async (label: "morning" | "noon") => {
  logger.log(`⏰ runScheduledBlog (${label}) started`);

  const postedCodesSnapshot = await db.collection("blogs").get();
  const postedCodes = postedCodesSnapshot.docs.map(doc => doc.data().sourceItemCode);

  const snapshot = await db.collection("monitoredItems").orderBy("sourceItemCode").get();

  const items = snapshot.docs
    .map(doc => doc.data())
    .filter(item => !postedCodes.includes(item.sourceItemCode))
    .slice(0, 1); // 1件だけ投稿

  if (items.length === 0) {
    logger.log("🚫 未投稿の商品が見つかりませんでした");
    return;
  }

  const item = items[0];
  try {
    logger.log(`🟢 generate blog for: ${item.sourceItemCode}`);
    await generateBlogFromItem(item);
    logger.log("✅ Blog generation complete");
  } catch (err) {
    logger.error("❌ Error generating blog", err);
  }
};
