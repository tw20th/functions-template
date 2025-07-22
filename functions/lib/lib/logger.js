"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const firebase_functions_1 = require("firebase-functions");
const chalk_1 = __importDefault(require("chalk"));
const isDev = process.env.NODE_ENV !== "production";
// カスタム logger（本番は Cloud Functions に記録、開発時は色付きログ）
exports.logger = {
    info: (...args) => {
        firebase_functions_1.logger.info(...args);
        if (isDev)
            console.log(chalk_1.default.blue("ℹ️", ...args));
    },
    warn: (...args) => {
        firebase_functions_1.logger.warn(...args);
        if (isDev)
            console.warn(chalk_1.default.yellow("⚠️", ...args));
    },
    error: (...args) => {
        firebase_functions_1.logger.error(...args);
        if (isDev)
            console.error(chalk_1.default.red("❌", ...args));
    },
    debug: (...args) => {
        firebase_functions_1.logger.debug(...args);
        if (isDev)
            console.debug(chalk_1.default.gray("🐛", ...args));
    },
    success: (...args) => {
        firebase_functions_1.logger.info("✅", ...args);
        if (isDev)
            console.log(chalk_1.default.green("✅", ...args));
    },
};
//# sourceMappingURL=logger.js.map