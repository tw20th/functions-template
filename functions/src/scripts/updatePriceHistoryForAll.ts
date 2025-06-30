// functions/src/scripts/updatePriceHistoryForAll.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccountJson from "../../serviceAccountKey.json";
import { ServiceAccount } from "firebase-admin";

initializeApp({
  credential: cert(serviceAccountJson as ServiceAccount),
});
const db = getFirestore();

export const updatePriceHistoryForAll = async (): Promise<void> => {
  const snapshot = await db.collection("monitoredItems").get(); // ✅ 修正：monitoredItems
  const now = new Date();
  const today = now.toISOString().slice(0, 10); // "YYYY-MM-DD"

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const price = data.price ?? 0; // ✅ monitoredItemsでは `price` フィールド想定
    const priceHistory: { date: string; price: number }[] =
      data.priceHistory ?? [];

    // ✅ 同日かつ同価格の履歴がある場合はスキップ
    const alreadyExists = priceHistory.some((entry) => {
      const entryDate = entry.date?.slice(0, 10);
      return entryDate === today && entry.price === price;
    });

    if (!alreadyExists) {
      const updatedHistory = [
        ...priceHistory,
        { date: now.toISOString(), price },
      ];
      await doc.ref.update({
        priceHistory: updatedHistory,
        updatedAt: now.toISOString(),
      });
      console.log(`✅ ${doc.id}: priceHistory に追加`);
    } else {
      console.log(`⏭️ ${doc.id}: 既に同一日付＋価格あり`);
    }
  }
};

if (require.main === module) {
  updatePriceHistoryForAll().catch((err) => {
    console.error("❌ エラー:", err);
    process.exit(1);
  });
}
