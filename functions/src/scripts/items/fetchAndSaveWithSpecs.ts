// functions/src/scripts/fetchAndSaveWithSpecs.ts
import "dotenv/config";
import axios from "axios";
import { db } from "../../lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { keywordsByDay } from "../../config/keywordsByDay";
import { logger } from "../../lib/logger"; // 🔹 差し替え済み

// --- 環境変数 ---
const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID ?? "";
const AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID ?? "";

// --- 型定義 ---
interface RakutenAPIItem {
  Item: {
    itemCode: string;
    itemName: string;
    itemPrice: number;
    shopName: string;
    affiliateUrl: string;
    mediumImageUrls: { imageUrl: string }[];
    itemCaption: string;
    reviewAverage?: string;
    reviewCount?: string;
  };
}

interface RakutenAPIResponse {
  Items: RakutenAPIItem[];
}

interface RakutenItem {
  itemCode: string;
  itemName: string;
  itemPrice: number;
  shopName: string;
  affiliateUrl: string;
  imageUrl: string;
  description: string;
  reviewAverage: number;
  reviewCount: number;
  capacity: number | null;
  outputPower: number | null;
  hasTypeC: boolean;
  displayName: string;
  shortTitle: string;
}

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
  return /(type[\s-]?c|usb[\s-]?c)/i.test(text);
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

export const fetchAndSaveWithSpecs = async () => {
  try {
    const today = new Date().getDay();
    const keyword = keywordsByDay[today] ?? "モバイルバッテリー";
    const hits = 30;

    logger.info(`📦 Fetching Rakuten items for keyword: ${keyword}`);

    const response = await axios.get<RakutenAPIResponse>(
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

    if (!response.data?.Items?.length) {
      logger.warn(`⚠️ No items returned from Rakuten API for keyword: ${keyword}`);
      return;
    }

    const items: RakutenItem[] = response.data.Items.map((entry): RakutenItem => {
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

    const chunks: string[][] = [];
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
      logger.info(`🟡 No new items found for keyword: ${keyword}`);
      return;
    }

    const now = Timestamp.now();
    const batch = db.batch();

    for (const item of newItems) {
      const ref = db.collection("rakutenItems").doc(item.itemCode);
      batch.set(ref, {
        ...item,
        createdAt: now,
        updatedAt: now.toDate().toISOString(),
        category: "モバイルバッテリー",
      });
    }

    await batch.commit();

    logger.success(`✅ ${newItems.length} new items saved to rakutenItems (keyword: ${keyword})`);
  } catch (err) {
    logger.error("❌ Error in fetchAndSaveWithSpecs:", err);
    throw err;
  }
};

// CLIで直接実行されたとき
if (require.main === module) {
  fetchAndSaveWithSpecs().catch(err => {
    logger.error("❌ CLI execution error:", err);
    process.exit(1);
  });
}
