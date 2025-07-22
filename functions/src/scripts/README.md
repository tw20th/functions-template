# 📜 Scripts一覧

## 商品関連

- `fetchAndSaveWithSpecs.ts`: 楽天APIから取得＋スペック抽出
- `fillMissingSpecs.ts`: 不足スペックを補完（descriptionなどから）

## フィルター・保存

- `filterAndSaveItems.ts`: itemFilterRules.jsonで絞り込み＋monitoredItems保存

## ブログ生成

- `generateBlogFromItem.ts`: 単体ブログ生成
- `scheduledBlogMorning.ts`: 朝記事（8:00）
- `scheduledBlogNoon.ts`: 昼記事（12:00）
- `generateRewrite.ts`: 低スコア記事の自動リライト（17:00）

## 分析

- `analyzeAllBlogs.ts`: 全ブログ記事の構成分析・スコアリング
