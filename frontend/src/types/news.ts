export interface News {
    id: string;
    title: string;
    content: string;
    summary: string;
    imageUrl?: string;
    source?: string;
    author?: string;
    category: NewsCategory;
    tags: string[];
    status: NewsStatus;
    isAiGenerated: boolean;
    views: number;
    likes: number;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
}

export enum NewsCategory {
    POLITICS = 'politics',
    ECONOMY = 'economy',
    TECHNOLOGY = 'technology',
    SCIENCE = 'science',
    SPORTS = 'sports',
    ENTERTAINMENT = 'entertainment',
    HEALTH = 'health',
    WORLD = 'world',
    OTHER = 'other',
}

export enum NewsStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    PUBLISHED = 'published',
    REJECTED = 'rejected',
    ARCHIVED = 'archived',
}

export interface NewsFilter {
    category?: NewsCategory;
    status?: NewsStatus;
    tags?: string[];
    search?: string;
    fromDate?: string;
    toDate?: string;
    isAiGenerated?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'publishedAt' | 'views' | 'likes';
    sortOrder?: 'ASC' | 'DESC';
}

export interface NewsResponse {
    data: News[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}