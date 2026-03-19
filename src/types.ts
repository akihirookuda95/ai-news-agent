export type Article = {
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedAt: string;
  importance: "high" | "medium" | "low";
};
