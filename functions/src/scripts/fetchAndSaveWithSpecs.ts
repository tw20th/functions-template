import "dotenv/config";
import axios from "axios";
import { db } from "../lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

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

// --- スペック抽出関数（description + itemName 対応）---
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

// --- 表示用タイトル生成関数 ---
const generateDisplayName = (itemName: string): string => {
  return itemName
    .replace(
      /(【.*?】|＼.*?／|★.*?％|！|!|最安|送料無料|レビュー特典|ポイント.*?)/g,
      ""
    )
    .trim();
};

const generateShortTitle = (itemName: string): string => {
  const match = itemName.match(/(モバイルバッテリー.*?\d{4,6}mAh)/i);
  return match ? match[1].replace(/\s+/g, "") : itemName.slice(0, 20);
};

// --- メイン処理 ---
const fetchAndSaveWithSpecs = async () => {
  const keyword = "モバイルバッテリー";
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
      },
    }
  );

  const items: RakutenItem[] = response.data.Items.map((entry: any) => {
    const item = entry.Item;
    const description = item.itemCaption ?? "";
    const itemName = item.itemName ?? "";
    const text = `${itemName} ${description}`;

    const capacity = parseCapacity(text);
    const outputPower = parseOutputPower(text);
    const hasTypeC = parseHasTypeC(text);
    const displayName = generateDisplayName(itemName);
    const shortTitle = generateShortTitle(itemName);

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
      capacity,
      outputPower,
      hasTypeC,
      displayName,
      shortTitle,
    };
  });

  const now = Timestamp.now();
  const batch = db.batch();

  for (const item of items) {
    const ref = db.collection("rakutenItems").doc(item.itemCode);
    batch.set(ref, {
      ...item,
      createdAt: now,
    });
  }

  await batch.commit();
  console.log(
    `✅ ${items.length} items saved to rakutenItems (with specs & titles)`
  );
};

fetchAndSaveWithSpecs().catch(console.error);
