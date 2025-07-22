"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelatedBlogs = void 0;
// utils/getRelatedBlogs.ts
const firebaseAdmin_1 = require("../lib/firebaseAdmin");
const getRelatedBlogs = async (currentSlug, tags, category, limit = 3) => {
    const blogsRef = firebaseAdmin_1.db.collection("blogs");
    const snapshot = await blogsRef
        .where("category", "==", category)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();
    const candidates = snapshot.docs
        .map(doc => doc.data())
        .filter(blog => { var _a; return blog.slug !== currentSlug && ((_a = blog.tags) === null || _a === void 0 ? void 0 : _a.some((tag) => tags.includes(tag))); });
    const sorted = candidates
        .map(blog => {
        var _a;
        return ({
            ...blog,
            tagMatchCount: ((_a = blog.tags) === null || _a === void 0 ? void 0 : _a.filter(tag => tags.includes(tag)).length) || 0,
        });
    })
        .sort((a, b) => b.tagMatchCount - a.tagMatchCount);
    return sorted.slice(0, limit);
};
exports.getRelatedBlogs = getRelatedBlogs;
//# sourceMappingURL=getRelatedBlogs.js.map