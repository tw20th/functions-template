"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSpecsFromText = void 0;
const specParsers_1 = require("./specParsers");
function extractSpecsFromText(text) {
    const outputPower = extractOutputPower(text);
    const capacity = (0, specParsers_1.parseCapacity)(text);
    const weight = (0, specParsers_1.parseWeight)(text);
    return { outputPower, capacity, weight };
}
exports.extractSpecsFromText = extractSpecsFromText;
// Output Power抽出：例 "20W", "出力20W", "合計出力: 22.5W", "5V/3A"
function extractOutputPower(text) {
    // ① 明示的なW表記を優先
    const matchW = text.match(/(?:出力|合計出力)?[:：]?\s*(\d+(?:\.\d+)?)\s*(W|ワット)/i);
    if (matchW) {
        const value = parseFloat(matchW[1]);
        if (value > 0 && value <= 100)
            return value;
    }
    // ② 電圧/電流表記（例：5V/3A → 15W）
    const matchVA = text.match(/(\d+(?:\.\d+)?)\s*V\s*[/×x＊*]\s*(\d+(?:\.\d+)?)\s*A/i);
    if (matchVA) {
        const volts = parseFloat(matchVA[1]);
        const amps = parseFloat(matchVA[2]);
        const calculated = volts * amps;
        if (calculated > 0 && calculated <= 100) {
            return Math.round(calculated);
        }
    }
    return undefined;
}
//# sourceMappingURL=extractSpecs.js.map