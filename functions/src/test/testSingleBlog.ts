import { db } from "../lib/firebaseAdmin";
import { generateBlogFromItem } from "../scripts/blog/generateBlogFromItem";
import { MonitoredItem } from "../types/blog"; // ✅ 型を明示

(async () => {
  const doc = await db.collection("monitoredItems").doc("aidort:10000403").get();
  if (!doc.exists) {
    console.log("❌ ドキュメントが見つかりません");
    return;
  }

  const data = doc.data();
  if (!data) {
    console.log("❌ doc.data() が undefined");
    return;
  }

  const item = data as MonitoredItem;
  await generateBlogFromItem(item);
})();
