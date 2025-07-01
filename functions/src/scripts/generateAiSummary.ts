import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import OpenAI from "openai";
import serviceAccountJson from "../../serviceAccountKey.json";
import { ServiceAccount } from "firebase-admin";
import "dotenv/config";

// Firebase 初期化
initializeApp({
  credential: cert(serviceAccountJson as ServiceAccount),
});

const db = getFirestore();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateAiSummary = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const snapshot = await db
    .collection("monitoredItems")
    .where("updatedAt", ">=", startOfToday.toISOString())
    .get();

  const batch = db.batch();
  let processedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // すでに要約がある場合はスキップ
    if (data.aiSummary) continue;

    const { displayName, featureHighlights = [], tags = [] } = data;
    const productName = displayName || data.productName || "この商品";

    const prompt = `次の特徴を持つモバイルバッテリー「${productName}」について、簡潔でわかりやすい魅力を説明してください。\n\n特徴:\n- ${featureHighlights.join(
      "\n- "
    )}\n\nタグ: ${tags.join(", ")}\n\n要約:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたはECサイト向けのマーケティングライターです。",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const aiSummary = completion.choices[0].message?.content?.trim() ?? "";
    batch.update(doc.ref, { aiSummary });
    processedCount++;
  }

  if (processedCount > 0) {
    await batch.commit();
    console.log(`✅ ${processedCount} 件の aiSummary を生成して保存しました`);
  } else {
    console.log("🟡 処理対象がありませんでした（すでに全て要約済み）");
  }
};

if (require.main === module) {
  generateAiSummary().catch(console.error);
}
