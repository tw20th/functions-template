// utils/getRelatedBlogs.ts
import { db } from "../lib/firebaseAdmin";
import type { BlogItem } from "../types/index";

export const getRelatedBlogs = async (
  currentSlug: string,
  tags: string[],
  category: string,
  limit = 3
): Promise<BlogItem[]> => {
  const blogsRef = db.collection("blogs");
  const snapshot = await blogsRef
    .where("category", "==", category)
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  const candidates = snapshot.docs
    .map(doc => doc.data() as BlogItem)
    .filter(
      blog => blog.slug !== currentSlug && blog.tags?.some((tag: string) => tags.includes(tag))
    );

  const sorted = candidates
    .map(blog => ({
      ...blog,
      tagMatchCount: blog.tags?.filter(tag => tags.includes(tag)).length || 0,
    }))
    .sort((a, b) => b.tagMatchCount - a.tagMatchCount);

  return sorted.slice(0, limit);
};
