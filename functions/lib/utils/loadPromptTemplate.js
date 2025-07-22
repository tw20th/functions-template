"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPromptTemplate = void 0;
// functions/src/utils/loadPromptTemplate.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * 指定されたテンプレート名の Markdown テキストを読み込む
 * @param templateName 例: "default"
 * @returns テンプレート文字列
 */
const loadPromptTemplate = (templateName) => {
    const safeName = templateName.replace(/[\\/:*?"<>|]/g, "");
    // Cloud Functions 実行時の __dirname = lib/utils/ → ../../prompts で届く
    const basePath = path_1.default.resolve(__dirname, "../../prompts");
    const candidates = [path_1.default.join(basePath, `${safeName}.md`), path_1.default.join(basePath, "default.md")];
    for (const file of candidates) {
        if (fs_1.default.existsSync(file)) {
            return fs_1.default.readFileSync(file, "utf-8");
        }
    }
    throw new Error(`プロンプトテンプレートが見つかりませんでした: ${templateName}`);
};
exports.loadPromptTemplate = loadPromptTemplate;
//# sourceMappingURL=loadPromptTemplate.js.map