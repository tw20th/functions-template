"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledBlogMorning = void 0;
// functions/src/scripts/scheduledBlogMorning.ts
const functions = __importStar(require("firebase-functions"));
const runScheduledBlog_1 = require("./runScheduledBlog");
const logger_1 = require("../../lib/logger");
exports.scheduledBlogMorning = functions.pubsub
    .schedule("every day 22:00") // JST 7:00 → UTC
    .timeZone("Asia/Tokyo")
    .onRun(async () => {
    logger_1.logger.info("🌅 scheduledBlogMorning 起動");
    await (0, runScheduledBlog_1.runScheduledBlog)(1, "morning");
    logger_1.logger.success("✅ scheduledBlogMorning 完了");
});
//# sourceMappingURL=scheduledBlogMorning.js.map