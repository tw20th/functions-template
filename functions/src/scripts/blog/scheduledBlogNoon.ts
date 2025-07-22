// functions/src/scripts/scheduledBlogNoon.ts
import * as functions from "firebase-functions";
import { runScheduledBlog } from "./runScheduledBlog";
import { logger } from "../../lib/logger";

export const scheduledBlogNoon = functions.pubsub
  .schedule("every day 03:00") // JST 12:00 → UTC
  .timeZone("Asia/Tokyo")
  .onRun(async () => {
    logger.info("🌞 scheduledBlogNoon 起動");
    await runScheduledBlog(1, "noon");
    logger.success("✅ scheduledBlogNoon 完了");
  });
