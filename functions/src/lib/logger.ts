import { logger as firebaseLogger } from "firebase-functions";
import chalk from "chalk";

const isDev = process.env.NODE_ENV !== "production";

// カスタム logger（本番は Cloud Functions に記録、開発時は色付きログ）
export const logger = {
  info: (...args: unknown[]) => {
    firebaseLogger.info(...args);
    if (isDev) console.log(chalk.blue("ℹ️", ...args));
  },

  warn: (...args: unknown[]) => {
    firebaseLogger.warn(...args);
    if (isDev) console.warn(chalk.yellow("⚠️", ...args));
  },

  error: (...args: unknown[]) => {
    firebaseLogger.error(...args);
    if (isDev) console.error(chalk.red("❌", ...args));
  },

  debug: (...args: unknown[]) => {
    firebaseLogger.debug(...args);
    if (isDev) console.debug(chalk.gray("🐛", ...args));
  },

  success: (...args: unknown[]) => {
    firebaseLogger.info("✅", ...args);
    if (isDev) console.log(chalk.green("✅", ...args));
  },
};
