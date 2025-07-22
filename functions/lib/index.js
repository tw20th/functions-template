"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledRewriteBlogs = exports.scheduledAnalyzeBlogs = exports.scheduledBlogPostNoon = exports.scheduledBlogPostMorning = exports.scheduledUpdatePrice = exports.scheduledGenerateSummary = exports.scheduledFilterAndSave = exports.scheduledFillMissingSpecs = exports.fetchRakutenItemsScheduled = void 0;
const functions = __importStar(require("firebase-functions"));
const fetchAndSaveWithSpecs_1 = require("./scripts/items/fetchAndSaveWithSpecs");
const filterAndSaveItems_1 = require("./scripts/items/filterAndSaveItems");
const generateAiSummary_1 = require("./scripts/ai/generateAiSummary");
const updatePriceHistoryForAll_1 = require("./scripts/items/updatePriceHistoryForAll");
const scheduledBlogMorning_1 = require("./scripts/blog/scheduledBlogMorning");
const scheduledBlogNoon_1 = require("./scripts/blog/scheduledBlogNoon");
const analyzeAllBlogs_1 = require("./scripts/analysis/analyzeAllBlogs");
const generateRewrite_1 = require("./scripts/blog/generateRewrite");
const fillMissingSpecs_1 = require("./scripts/items/fillMissingSpecs");
// 🔄 fetch + save（楽天APIから取得してrakutenItemsへ）
exports.fetchRakutenItemsScheduled = functions
    .region("asia-northeast1")
    .pubsub.schedule("every day 05:00")
    .timeZone("Asia/Tokyo")
    .onRun(fetchAndSaveWithSpecs_1.fetchAndSaveWithSpecs);
// 🔧 不足スペック補完（descriptionやitemNameから補完）
exports.scheduledFillMissingSpecs = functions
    .region("asia-northeast1")
    .pubsub.schedule("every day 05:05")
    .timeZone("Asia/Tokyo")
    .onRun(fillMissingSpecs_1.fillMissingSpecs);
// 🎯 rakutenItems → monitoredItems（フィルター＋保存）
exports.scheduledFilterAndSave = functions
    .region("asia-northeast1")
    .pubsub.schedule("every day 05:10")
    .timeZone("Asia/Tokyo")
    .onRun(filterAndSaveItems_1.filterAndSaveItems);
// ✨ monitoredItemsに対してAI要約生成
exports.scheduledGenerateSummary = functions
    .region("asia-northeast1")
    .pubsub.schedule("every day 05:20")
    .timeZone("Asia/Tokyo")
    .onRun(generateAiSummary_1.generateAiSummary);
// 💰 monitoredItemsに価格履歴を追加
exports.scheduledUpdatePrice = functions
    .region("asia-northeast1")
    .pubsub.schedule("every day 05:30")
    .timeZone("Asia/Tokyo")
    .onRun(updatePriceHistoryForAll_1.updatePriceHistoryForAll);
// ✍️ ブログ記事（朝分）
exports.scheduledBlogPostMorning = functions
    .region("asia-northeast1")
    .pubsub.schedule("every day 08:00")
    .timeZone("Asia/Tokyo")
    .onRun(scheduledBlogMorning_1.scheduledBlogMorning);
// ✍️ ブログ記事（昼分）
exports.scheduledBlogPostNoon = functions
    .region("asia-northeast1")
    .pubsub.schedule("every day 12:00")
    .timeZone("Asia/Tokyo")
    .onRun(scheduledBlogNoon_1.scheduledBlogNoon);
// 📊 ブログ分析（構成・スコア）
exports.scheduledAnalyzeBlogs = functions
    .region("asia-northeast1")
    .pubsub.schedule("every day 13:00")
    .timeZone("Asia/Tokyo")
    .onRun(analyzeAllBlogs_1.analyzeAllBlogs);
// 📝 スコアの低い記事をリライト
exports.scheduledRewriteBlogs = functions
    .region("asia-northeast1")
    .pubsub.schedule("every day 17:00")
    .timeZone("Asia/Tokyo")
    .onRun(generateRewrite_1.generateRewrite);
//# sourceMappingURL=index.js.map