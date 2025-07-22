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
 * プロンプトテンプレートを読み込む関数
 * 実行時ディレクトリ：lib/analyze/
 * 探す場所：../../prompts/default.md → functions/prompts/
 */
const loadPromptTemplate = (templateName) => {
    const safeName = templateName.replace(/[\\/:*?"<>|]/g, "");
    const basePath = path_1.default.resolve(__dirname, "../../prompts"); // ← functions/prompts に届く
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