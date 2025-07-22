// functions/src/scripts/scheduledBlogMorning.ts
import * as functions from "firebase-functions";
import { runScheduledBlog } from "./runScheduledBlog";
import { logger } from "../../lib/logger";

export const scheduledBlogMorning = functions.pubsub
  .schedule("every day 22:00") // JST 7:00 → UTC
  .timeZone("Asia/Tokyo")
  .onRun(async () => {
    logger.info("🌅 scheduledBlogMorning 起動");
    await runScheduledBlog(1, "morning");
    logger.success("✅ scheduledBlogMorning 完了");
  });
