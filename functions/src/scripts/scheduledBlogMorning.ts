// functions/src/scripts/scheduledBlogMorning.ts
import { runScheduledBlog } from "./runScheduledBlog";

export const scheduledBlogMorning = async () => {
  await runScheduledBlog("morning");
};
