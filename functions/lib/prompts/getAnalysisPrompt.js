"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalysisPrompt = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const getAnalysisPrompt = async (content, promptType = "default") => {
    const filePath = path_1.default.join(__dirname, "analyzePrompt", `${promptType}.txt`);
    const template = await promises_1.default.readFile(filePath, "utf-8");
    return template.replace("{{content}}", content);
};
exports.getAnalysisPrompt = getAnalysisPrompt;
//# sourceMappingURL=getAnalysisPrompt.js.map