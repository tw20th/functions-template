import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccountJson from "../../serviceAccountKey.json";
import { applyFilterRules } from "../utils/filterUtils";
import { extractFeatures } from "../utils/featureUtils";
import filterRules from "../config/itemFilterRules.json";
import { ServiceAccount } from "firebase-admin";

const app = initializeApp({
  credential: cert(serviceAccountJson as ServiceAccount),
});
const db = getFirestore(app);

export const filterAndSaveItems = async (): Promise<void> => {
  const snapshot = await db.collection("rakutenItems").get();
  const now = new Date();
  const batch = db.batch();

  for (const doc of snapshot.docs) {
    const data = doc.data();

    const passedRule = applyFilterRules(data, filterRules as any);
    if (!passedRule) continue;

    const featureHighlights = extractFeatures(data);
    const tags = passedRule.tags || [];

    const monitoredRef = db.collection("monitoredItems").doc(doc.id);
    const monitoredDoc = await monitoredRef.get();
    const previousData = monitoredDoc.exists ? monitoredDoc.data() : null;

    const rawHistory = previousData?.priceHistory ?? [];

    const priceHistory = rawHistory.filter(
      (entry: unknown): entry is { date: string; price: number } =>
        typeof entry === "object" &&
        entry !== null &&
        "date" in entry &&
        "price" in entry
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

    // ✅ merge: true を指定して aiSummary など既存フィールドを維持
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
        updatedAt: now.toISOString(),
      },
      { merge: true } // 🔥←ここがポイント！
    );
  }

  await batch.commit();
  console.log("✅ monitoredItems に保存完了（aiSummary維持・merge対応）");
};

if (require.main === module) {
  filterAndSaveItems().catch((e) => {
    console.error("❌ エラー:", e);
    process.exit(1);
  });
}
