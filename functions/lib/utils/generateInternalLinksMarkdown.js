"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInternalLinksMarkdown = void 0;
const generateInternalLinksMarkdown = (relatedBlogs) => {
    if (relatedBlogs.length === 0)
        return "";
    const links = relatedBlogs.map(blog => `- 👉 [${blog.title}](/blog/${blog.slug})`).join("\n");
    return `
---

## 関連記事・あわせて読みたい

${links}
`;
};
exports.generateInternalLinksMarkdown = generateInternalLinksMarkdown;
//# sourceMappingURL=generateInternalLinksMarkdown.js.map