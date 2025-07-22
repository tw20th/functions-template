// functions/src/types/blog.ts

export type Blog = {
  slug?: string;
  content: string;
  summary?: string;
  analysisHistory?: {
    score: number;
    suggestedTitle: string;
    suggestedOutline: string[];
    suggestedRewritePrompt: string;
    summary: string;
    createdAt: FirebaseFirestore.Timestamp;
  }[];
};

// ✅ 追加：generateBlogFromItem などで使用する型
export type MonitoredItem = {
  productName: string;
  sourceItemCode: string;
  category?: string;
  featureHighlights?: string[];
  price?: number;
  tags?: string[];
  imageUrl?: string;

  // 🔽 以下を追加
  affiliateUrl?: string;
  aiSummary?: string;
  timeSlot?: "morning" | "noon";
};
