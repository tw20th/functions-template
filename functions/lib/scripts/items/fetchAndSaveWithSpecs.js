"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndSaveWithSpecs = void 0;
// functions/src/scripts/fetchAndSaveWithSpecs.ts
require("dotenv/config");
const axios_1 = __importDefault(require("axios"));
const firebaseAdmin_1 = require("../../lib/firebaseAdmin");
const firestore_1 = require("firebase-admin/firestore");
const keywordsByDay_1 = require("../../config/keywordsByDay");
const logger_1 = require("../../lib/logger"); // 🔹 差し替え済み
// --- 環境変数 ---
const RAKUTEN_APP_ID = (_a = process.env.RAKUTEN_APP_ID) !== null && _a !== void 0 ? _a : "";
const AFFILIATE_ID = (_b = process.env.RAKUTEN_AFFILIATE_ID) !== null && _b !== void 0 ? _b : "";
const parseCapacity = (text) => {
    const match = text.match(/(\d{4,6})\s*(mAh|ｍＡｈ|mah|ｍａｈ)/i);
    return match ? parseInt(match[1], 10) : null;
};
const parseOutputPower = (text) => {
    const matchW = text.match(/(?:出力)?\s*(\d{2,3})\s*W/i);
    if (matchW)
        return parseInt(matchW[1], 10);
    const matchVA = text.match(/(\d+(?:\.\d+)?)V\s*\/\s*(\d+(?:\.\d+)?)A/i);
    if (matchVA) {
        const volts = parseFloat(matchVA[1]);
        const amps = parseFloat(matchVA[2]);
        return Math.round(volts * amps);
    }
    return null;
};
const parseHasTypeC = (text) => {
    return /(type[\s-]?c|usb[\s-]?c)/i.test(text);
};
const generateDisplayName = (itemName) => {
    return itemName
        .replace(/(【.*?】|＼.*?／|★.*?％|！|!|最安|送料無料|レビュー特典|ポイント.*?)/g, "")
        .trim();
};
const generateShortTitle = (itemName) => {
    const match = itemName.match(/(モバイルバッテリー.*?\d{4,6}mAh)/i);
    return match ? match[1].replace(/\s+/g, "") : itemName.slice(0, 20);
};
const fetchAndSaveWithSpecs = async () => {
    var _a, _b, _c;
    try {
        const today = new Date().getDay();
        const keyword = (_a = keywordsByDay_1.keywordsByDay[today]) !== null && _a !== void 0 ? _a : "モバイルバッテリー";
        const hits = 30;
        logger_1.logger.info(`📦 Fetching Rakuten items for keyword: ${keyword}`);
        const response = await axios_1.default.get("https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601", {
            params: {
                applicationId: RAKUTEN_APP_ID,
                affiliateId: AFFILIATE_ID,
                keyword,
                hits,
                format: "json",
                sort: "-reviewCount",
            },
        });
        if (!((_c = (_b = response.data) === null || _b === void 0 ? void 0 : _b.Items) === null || _c === void 0 ? void 0 : _c.length)) {
            logger_1.logger.warn(`⚠️ No items returned from Rakuten API for keyword: ${keyword}`);
            return;
        }
        const items = response.data.Items.map((entry) => {
            var _a, _b, _c, _d, _e;
            const item = entry.Item;
            const description = (_a = item.itemCaption) !== null && _a !== void 0 ? _a : "";
            const itemName = (_b = item.itemName) !== null && _b !== void 0 ? _b : "";
            const text = `${itemName} ${description}`;
            return {
                itemCode: item.itemCode,
                itemName,
                itemPrice: item.itemPrice,
                shopName: item.shopName,
                affiliateUrl: item.affiliateUrl,
                imageUrl: (_e = (_d = (_c = item.mediumImageUrls) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.imageUrl) !== null && _e !== void 0 ? _e : "",
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
        const chunks = [];
        for (let i = 0; i < itemCodes.length; i += 10) {
            chunks.push(itemCodes.slice(i, i + 10));
        }
        const existingItemCodes = new Set();
        for (const chunk of chunks) {
            const snapshot = await firebaseAdmin_1.db.collection("rakutenItems").where("itemCode", "in", chunk).get();
            snapshot.docs.forEach(doc => existingItemCodes.add(doc.id));
        }
        const newItems = items.filter(item => !existingItemCodes.has(item.itemCode)).slice(0, 30);
        if (newItems.length === 0) {
            logger_1.logger.info(`🟡 No new items found for keyword: ${keyword}`);
            return;
        }
        const now = firestore_1.Timestamp.now();
        const batch = firebaseAdmin_1.db.batch();
        for (const item of newItems) {
            const ref = firebaseAdmin_1.db.collection("rakutenItems").doc(item.itemCode);
            batch.set(ref, {
                ...item,
                createdAt: now,
                updatedAt: now.toDate().toISOString(),
                category: "モバイルバッテリー",
            });
        }
        await batch.commit();
        logger_1.logger.success(`✅ ${newItems.length} new items saved to rakutenItems (keyword: ${keyword})`);
    }
    catch (err) {
        logger_1.logger.error("❌ Error in fetchAndSaveWithSpecs:", err);
        throw err;
    }
};
exports.fetchAndSaveWithSpecs = fetchAndSaveWithSpecs;
// CLIで直接実行されたとき
if (require.main === module) {
    (0, exports.fetchAndSaveWithSpecs)().catch(err => {
        logger_1.logger.error("❌ CLI execution error:", err);
        process.exit(1);
    });
}
//# sourceMappingURL=fetchAndSaveWithSpecs.js.map