"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRewrite = void 0;
// functions/src/rewrite/generateRewrite.ts
const openai_1 = require("../lib/openai");
const generateRewrite = async ({ originalContent, suggestedTitle, suggestedOutline, suggestedRewritePrompt, productName, }) => {
    const systemPrompt = "あなたはSEOとUXに強いプロのWeb編集者です。";
    const userPrompt = `
以下の構成・指示・元記事をもとに、読者にとって自然で役立つブログ記事をMarkdown形式でリライトしてください。

## 📝 タイトル案
${suggestedTitle}

## 🧩 見出し構成
${suggestedOutline.map((h, i) => `${i + 1}. ${h}`).join("\n")}

## 📌 リライト指示
${suggestedRewritePrompt}

## 📄 元記事（参考）
${originalContent}

---

## ✅ 出力ルール
- SEOスコアや分析に関する記述は**一切含めない**でください
- 読者にとって自然で読みやすい記事構成にしてください
- 商品紹介（${productName !== null && productName !== void 0 ? productName : "該当商品"}）を含め、**特徴・活用シーン・選び方**を具体的に書いてください
- CTA（購入の後押し）や内部リンクの案内を自然な流れで入れてください
- Markdown形式で出力（## 見出し、- 箇条書き など）
`;
    const response = await (0, openai_1.generateContentWithOpenAI)({
        system: systemPrompt,
        user: userPrompt,
    });
    return response;
};
exports.generateRewrite = generateRewrite;
//# sourceMappingURL=generateRewrite.js.map