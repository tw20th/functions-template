// 容量パーサー：例 "20000mAh", "20,000mAh", "20Ah", "容量：10000mah"
export function parseCapacity(text: string): number | undefined {
  // 1. 数字 + mAh
  const mahMatch = text.match(/(\d{4,6})\s?(mAh|mah|ｍＡｈ|ｍａｈ)/i);
  if (mahMatch) return parseInt(mahMatch[1], 10);

  // 2. カンマ付き表記：例 "20,000mAh"
  const commaMahMatch = text.match(/(\d{1,3}(?:,\d{3})+)\s?(mAh|mah)/i);
  if (commaMahMatch) {
    const normalized = commaMahMatch[1].replace(/,/g, "");
    return parseInt(normalized, 10);
  }

  // 3. Ah表記 → mAhに換算：例 "20Ah" → 20000mAh
  const ahMatch = text.match(/(\d+(?:\.\d+)?)\s?(Ah|ａｈ)/i);
  if (ahMatch) {
    const ah = parseFloat(ahMatch[1]);
    return Math.round(ah * 1000);
  }

  return undefined;
}

// 重量パーサー：例 "重さ: 約180g", "180グラム", "0.18kg", "重量：200 g"
export function parseWeight(text: string): number | undefined {
  // 1. 明示的なg（グラム）表記
  const gramMatch = text.match(/約?(\d{2,4})\s?(g|グラム|ｇ)/i);
  if (gramMatch) return parseInt(gramMatch[1], 10);

  // 2. kg表記 → g換算
  const kgMatch = text.match(/(\d+(?:\.\d+)?)\s?(kg|キログラム|ｋｇ)/i);
  if (kgMatch) {
    const kg = parseFloat(kgMatch[1]);
    return Math.round(kg * 1000);
  }

  return undefined;
}
