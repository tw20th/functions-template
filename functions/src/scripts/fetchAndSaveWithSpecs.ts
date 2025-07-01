import "dotenv/config";
import axios from "axios";
import { db } from "../lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { keywordsByDay } from "../config/keywordsByDay";

// --- APIキー設定 ---
const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID ?? "";
const AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID ?? "";

// --- インターフェース定義 ---
interface RakutenItem {
  itemCode: string;
  itemName: string;
  itemPrice: number;
  shopName: string;
  affiliateUrl: string;
  imageUrl: string;
  description: string;
  reviewAverage?: number;
  reviewCount?: number;
  capacity?: number | null;
  outputPower?: number | null;
  hasTypeC?: boolean;
  displayName?: string;
  shortTitle?: string;
}

// --- スペック抽出関数 ---
const parseCapacity = (text: string): number | null => {
  const match = text.match(/(\d{4,6})\s*(mAh|ｍＡｈ|mah|ｍａｈ)/i);
  return match ? parseInt(match[1], 10) : null;
};

const parseOutputPower = (text: string): number | null => {
  const matchW = text.match(/(?:出力)?\s*(\d{2,3})\s*W/i);
  if (matchW) return parseInt(matchW[1], 10);

  const matchVA = text.match(/(\d+(?:\.\d+)?)V\s*\/\s*(\d+(?:\.\d+)?)A/i);
  if (matchVA) {
    const volts = parseFloat(matchVA[1]);
    const amps = parseFloat(matchVA[2]);
    return Math.round(volts * amps);
  }

  return null;
};

const parseHasTypeC = (text: string): boolean => {
  return /(type[\s\-]?c|usb[\s\-]?c)/i.test(text);
};

const generateDisplayName = (itemName: string): string => {
  return itemName
    .replace(/(【.*?】|＼.*?／|★.*?％|！|!|最安|送料無料|レビュー特典|ポイント.*?)/g, "")
    .trim();
};

const generateShortTitle = (itemName: string): string => {
  const match = itemName.match(/(モバイルバッテリー.*?\d{4,6}mAh)/i);
  return match ? match[1].replace(/\s+/g, "") : itemName.slice(0, 20);
};

// --- メイン処理 ---
export const fetchAndSaveWithSpecs = async () => {
  const today = new Date().getDay(); // 0（日）〜 6（土）
  const keyword = keywordsByDay[today] ?? "モバイルバッテリー";
  const hits = 30;

  const response = await axios.get<{ Items: any[] }>(
    "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601",
    {
      params: {
        applicationId: RAKUTEN_APP_ID,
        affiliateId: AFFILIATE_ID,
        keyword,
        hits,
        format: "json",
        sort: "-reviewCount",
      },
    }
  );

  const items: RakutenItem[] = response.data.Items.map((entry: any) => {
    const item = entry.Item;
    const description = item.itemCaption ?? "";
    const itemName = item.itemName ?? "";
    const text = `${itemName} ${description}`;

    return {
      itemCode: item.itemCode,
      itemName,
      itemPrice: item.itemPrice,
      shopName: item.shopName,
      affiliateUrl: item.affiliateUrl,
      imageUrl: item.mediumImageUrls?.[0]?.imageUrl ?? "",
      description,
      reviewAverage: Number(item.reviewAverage) || 0,
      reviewCount: Number(item.reviewCount) || 0,
      capacity: parseCapacity(text),
      outputPower: parseOutputPower(text),
      hasTypeC: parseHasTypeC(text),
      displayName: generateDisplayName(itemName),
      shortTitle: generateShortTitle(itemName),
    };
  });

  const itemCodes = items.map(item => item.itemCode);

  // Firestoreにすでにある itemCode を取得
  const chunks = [];
  for (let i = 0; i < itemCodes.length; i += 10) {
    chunks.push(itemCodes.slice(i, i + 10));
  }

  const existingItemCodes = new Set<string>();
  for (const chunk of chunks) {
    const snapshot = await db.collection("rakutenItems").where("itemCode", "in", chunk).get();
    snapshot.docs.forEach(doc => existingItemCodes.add(doc.id));
  }

  const newItems = items.filter(item => !existingItemCodes.has(item.itemCode)).slice(0, 30);

  if (newItems.length === 0) {
    console.log(`🟡 No new items found for keyword: ${keyword}`);
    return;
  }

  const now = Timestamp.now();
  const batch = db.batch();

  for (const item of newItems) {
    const ref = db.collection("rakutenItems").doc(item.itemCode);
    batch.set(ref, {
      ...item,
      createdAt: now,
    });
  }

  await batch.commit();
  console.log(`✅ ${newItems.length} new items saved to rakutenItems (keyword: ${keyword})`);
};

// CLIで直接実行された場合
if (require.main === module) {
  fetchAndSaveWithSpecs().catch(err => {
    console.error("❌ Error in fetchAndSaveWithSpecs:", err);
  });
}
