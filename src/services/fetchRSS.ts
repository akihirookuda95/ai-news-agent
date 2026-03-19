import RSSParser from "rss-parser";
import type { Article } from "../types.js";


const parser = new RSSParser();

const FEED_SOURCES = [
  { url: "https://news.ycombinator.com/rss", source: "Hacker News" },
  { url: "https://zenn.dev/feed", source: "Zenn" },
  { url: "https://dev.to/feed", source: "Dev.to" },
]

function normalizeArticle(item: RSSParser.Item, source: string): Article {
  return {
    title: item.title ?? "",
    url: item.link ?? "",
    summary: "", // Day3でClaude APIが埋めるまでの暫定値
    source,
    publishedAt: item.pubDate ?? item.isoDate?? "", // HNはpubDate、ZennやDev.toはisoDateを使用しているため両方を考慮
    importance: "low", // Day3でClaude APIが埋めるまでの暫定値
  };
}


export async function fetchRSS():
