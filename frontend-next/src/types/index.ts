export interface News {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  source?: string;
  sourceUrl?: string;
  category: string;
  tags?: string[];
  status: string;
  isAiGenerated: boolean;
  views: number;
  likes: number;
  author?: string;
  publishedAt: string;
  createdAt: string;
}

export interface NewsResponse {
  data: News[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
  };
}
