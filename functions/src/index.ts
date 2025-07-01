import * as functions from "firebase-functions";
import { fetchAndSaveWithSpecs } from "./scripts/fetchAndSaveWithSpecs";
import { filterAndSaveItems } from "./scripts/filterAndSaveItems";
import { generateAiSummary } from "./scripts/generateAiSummary";
import { updatePriceHistoryForAll } from "./scripts/updatePriceHistoryForAll";
import { scheduledBlogMorning } from "./scripts/scheduledBlogMorning";
import { scheduledBlogNoon } from "./scripts/scheduledBlogNoon";
import { analyzeAllBlogs } from "./scripts/analyzeAllBlogs";
import { generateRewrite } from "./scripts/generateRewrite";
import { fillMissingSpecs } from "./scripts/fillMissingSpecs"; // 🔹 追加

// 🔄 fetch + save（楽天APIから取得してrakutenItemsへ）
export const scheduledFetchAndSave = functions.pubsub
  .schedule("every day 05:00")
  .timeZone("Asia/Tokyo")
  .onRun(fetchAndSaveWithSpecs);

// 🔧 不足スペック補完（descriptionやitemNameから補完）
export const scheduledFillMissingSpecs = functions.pubsub
  .schedule("every day 05:05")
  .timeZone("Asia/Tokyo")
  .onRun(fillMissingSpecs);

// 🎯 rakutenItems → monitoredItems（フィルター＋保存）
export const scheduledFilterAndSave = functions.pubsub
  .schedule("every day 05:10")
  .timeZone("Asia/Tokyo")
  .onRun(filterAndSaveItems);

// ✨ monitoredItemsに対してAI要約生成
export const scheduledGenerateSummary = functions.pubsub
  .schedule("every day 05:20")
  .timeZone("Asia/Tokyo")
  .onRun(generateAiSummary);

// 💰 monitoredItemsに価格履歴を追加
export const scheduledUpdatePrice = functions.pubsub
  .schedule("every day 05:30")
  .timeZone("Asia/Tokyo")
  .onRun(updatePriceHistoryForAll);

// ✍️ ブログ記事（朝分）
export const scheduledBlogPostMorning = functions.pubsub
  .schedule("every day 08:00")
  .timeZone("Asia/Tokyo")
  .onRun(scheduledBlogMorning);

// ✍️ ブログ記事（昼分）
export const scheduledBlogPostNoon = functions.pubsub
  .schedule("every day 12:00")
  .timeZone("Asia/Tokyo")
  .onRun(scheduledBlogNoon);

// 📊 ブログ分析（構成・スコア）
export const scheduledAnalyzeBlogs = functions.pubsub
  .schedule("every day 13:00")
  .timeZone("Asia/Tokyo")
  .onRun(analyzeAllBlogs);

// 📝 スコアの低い記事をリライト
export const scheduledRewriteBlogs = functions.pubsub
  .schedule("every day 17:00")
  .timeZone("Asia/Tokyo")
  .onRun(generateRewrite);
