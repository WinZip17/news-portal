export interface RequestWithUser {
  user: { id: string };
}

export interface AiRewriteResult {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
}

export interface RssFeedItem {
  title?: string;
  'content:encoded'?: string;
  content?: string;
  description?: string;
  contentSnippet?: string;
  link?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
  enclosure?: { url: string };
  'media:content'?: { url: string };
  categories?: string[];
}

export interface RssArticle {
  title: string;
  content: string;
  summary: string;
  link: string;
  pubDate: Date;
  source: string;
  author: string;
  imageUrl: string;
  categories: string[];
}
