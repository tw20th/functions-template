import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { ServiceAccount } from "firebase-admin";
import serviceAccountJson from "../../serviceAccountKey.json";
import { extractSpecsFromText } from "../utils/extractSpecs";

// Firebase 初期化
initializeApp({
  credential: cert(serviceAccountJson as ServiceAccount),
});
const db = getFirestore();

// スペック補完処理
export async function fillMissingSpecs() {
  const snapshot = await db.collection("rakutenItems").get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const { outputPower, capacity, weight, description, itemName } = data;

    // 補完が必要な条件
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
      console.log(`✅ ${doc.id} を更新しました:`, updateData);
    }
  }

  console.log("🎉 スペック補完完了");
}

// 関数を即実行
fillMissingSpecs();
