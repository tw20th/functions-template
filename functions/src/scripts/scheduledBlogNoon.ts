// functions/src/scripts/scheduledBlogNoon.ts
import { runScheduledBlog } from "./runScheduledBlog";

export const scheduledBlogNoon = async () => {
  await runScheduledBlog("noon");
};
