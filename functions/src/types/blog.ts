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
