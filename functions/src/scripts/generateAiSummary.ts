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

// OpenAI 初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateAiSummary = async () => {
  const snapshot = await db.collection("monitoredItems").get();

  const batch = db.batch();
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
      model: "gpt-3.5-turbo", // ← ここを変更
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
  }

  await batch.commit();
  console.log("✅ aiSummary を生成して保存しました");
};

if (require.main === module) {
  generateAiSummary().catch(console.error);
}
