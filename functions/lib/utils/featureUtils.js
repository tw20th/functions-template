"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFeatures = void 0;
function extractFeatures(data) {
    const features = [];
    if (data.capacity != null) {
        if (data.capacity >= 20000) {
            features.push("大容量で長持ち");
        }
        else if (data.capacity >= 10000) {
            features.push("十分な容量");
        }
        else {
            features.push("コンパクト容量");
        }
    }
    if (data.outputPower != null) {
        if (data.outputPower >= 18) {
            features.push("急速充電に対応");
        }
        else {
            features.push("通常充電対応");
        }
    }
    if (data.hasTypeC) {
        features.push("Type-Cポート搭載");
    }
    // ✅ weight による特徴付け
    if (data.weight != null) {
        if (data.weight < 150) {
            features.push("超軽量で持ち運びに最適");
        }
        else if (data.weight < 200) {
            features.push("軽量で持ち運びやすい");
        }
        else {
            features.push("やや重めの設計");
        }
    }
    return features;
}
exports.extractFeatures = extractFeatures;
//# sourceMappingURL=featureUtils.js.map