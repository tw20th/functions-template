import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../../serviceAccountKey.json";

initializeApp({ credential: cert(serviceAccount as any) });

const db = getFirestore();
const collectionRef = db.collection("rakutenItems");

// --- 抽出ロジック ---

function extractOutputPower(text: string): number | null {
  // 20W / 65W / PD対応45W など
  const wattMatch = text.match(/(?:PD.*)?(?:出力)?\s*(\d{2,3})\s*W/i);
  if (wattMatch) return parseInt(wattMatch[1], 10);

  // 5V/2.1A → 10.5W など
  const voltAmpMatch = text.match(
    /(?:DC)?\s*5[Vv][\/\\]?\s*(\d+(\.\d+)?)\s*A/i
  );
  if (voltAmpMatch) return Math.round(parseFloat(voltAmpMatch[1]) * 5);

  // 2.4A 出力 など（5V想定）
  const ampOnlyMatch = text.match(/(\d+(\.\d+)?)\s*A(?:出力)?/i);
  if (ampOnlyMatch) return Math.round(parseFloat(ampOnlyMatch[1]) * 5);

  return null;
}

function extractCapacity(text: string): number | null {
  const match = text.match(/(\d{4,6})\s*mAh/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

function extractHasTypeC(text: string): boolean {
  return /type[-\s]?c|usb[-\s]?c/i.test(text);
}

// --- メイン処理 ---

async function fillFromDescription() {
  const snapshot = await collectionRef.get();

  const updates = snapshot.docs.map(async (doc) => {
    const data = doc.data();
    const text = `${data.itemName ?? ""} ${data.description ?? ""}`.trim();

    if (!text || text.length < 10) return;

    const updates: Record<string, unknown> = {};

    const power = extractOutputPower(text);
    if (power !== null) updates.outputPower = power;

    const capacity = extractCapacity(text);
    if (capacity !== null) updates.capacity = capacity;

    updates.hasTypeC = extractHasTypeC(text);

    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
      console.log(`✅ ${doc.id} updated:`, updates);
    }
  });

  await Promise.all(updates);
  console.log("🎉 All documents processed with full text analysis.");
}

fillFromDescription().catch(console.error);
