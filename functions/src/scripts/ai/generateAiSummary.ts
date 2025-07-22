// functions/src/scripts/generateAiSummary.ts
import "dotenv/config";
import { db } from "../../lib/firebaseAdmin";
import { Configuration, OpenAIApi } from "openai";
import { logger } from "../../lib/logger";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const generateAiSummary = async () => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const snapshot = await db
      .collection("monitoredItems")
      .where("updatedAt", ">=", startOfToday.toISOString())
      .get();

    if (snapshot.empty) {
      logger.info("🟡 今日更新された monitoredItems はありませんでした");
      return;
    }

    const batch = db.batch();
    let processedCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      if (data.aiSummary) continue;

      const { displayName, featureHighlights = [], tags = [] } = data;
      const productName = displayName || data.productName || "この商品";

      const prompt = `次の特徴を持つモバイルバッテリー「${productName}」について、簡潔でわかりやすい魅力を説明してください。\n\n特徴:\n- ${featureHighlights.join(
        "\n- "
      )}\n\nタグ: ${tags.join(", ")}\n\n要約:`;

      try {
        const completion = await openai.createChatCompletion({
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

        const aiSummary = completion.data.choices[0].message?.content?.trim() ?? "";

        if (!aiSummary) {
          logger.warn(`⚠️ 要約生成に失敗（空）: ${productName}`);
          continue;
        }

        batch.update(doc.ref, { aiSummary });
        processedCount++;
      } catch (err) {
        logger.error(`❌ OpenAIエラー: ${productName}`, err);
        continue; // この商品だけスキップ
      }
    }

    if (processedCount > 0) {
      await batch.commit();
      logger.success(`✅ ${processedCount} 件の aiSummary を生成して保存しました`);
    } else {
      logger.info("🟡 処理対象がありませんでした（すでに全て要約済み）");
    }
  } catch (err) {
    logger.error("❌ generateAiSummary 実行時エラー:", err);
    throw err;
  }
};

// CLI 実行用
if (require.main === module) {
  generateAiSummary().catch(err => {
    logger.error("❌ CLI実行時エラー:", err);
    process.exit(1);
  });
}
