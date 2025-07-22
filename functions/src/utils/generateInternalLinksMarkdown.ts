// utils/generateInternalLinksMarkdown.ts
import type { BlogItem } from "../types/index";

export const generateInternalLinksMarkdown = (relatedBlogs: BlogItem[]): string => {
  if (relatedBlogs.length === 0) return "";

  const links = relatedBlogs.map(blog => `- 👉 [${blog.title}](/blog/${blog.slug})`).join("\n");

  return `
---

## 関連記事・あわせて読みたい

${links}
`;
};
