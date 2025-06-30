// functions/src/scripts/runScheduledBlog.ts
import { db } from "../lib/firebaseAdmin";
import { generateBlogFromItem } from "./generateBlogFromItem";

const runScheduledBlogHandler = async () => {
  console.log("⏰ scheduledBlogHandler started");

  // 既に投稿済みの sourceItemCode を取得
  const blogSnapshot = await db.collection("blogs").get();
  const postedCodes = blogSnapshot.docs.map((doc) => doc.data().sourceItemCode);

  // monitoredItems から未投稿の商品を2件取得（Firestore の not-in は最大10件まで）
  const candidateSnapshot = await db
    .collection("monitoredItems")
    .where("sourceItemCode", "not-in", postedCodes.slice(0, 10))
    .limit(1)
    .get();

  if (candidateSnapshot.empty) {
    console.log("🚫 未投稿の商品が見つかりませんでした");
    return;
  }

  const items = candidateSnapshot.docs.map((doc) => doc.data());

  for (const item of items) {
    try {
      console.log(`🟢 generate blog for: ${item.sourceItemCode}`);
      await generateBlogFromItem(item);
    } catch (err) {
      console.error("❌ Error generating blog", err);
    }
  }

  console.log("✅ scheduledBlogHandler complete");
};

// 実行
runScheduledBlogHandler();
