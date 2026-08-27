import type {
  CreateNewsDto,
  ModerationBody,
  NewsFilter,
  NewsItem,
  NewsResponse,
  SmartSearchResponse,
  StatsResponse,
} from '~/types';

export function useNewsService() {
  const { apiFetch } = useApi();

  async function getNews(filter?: NewsFilter): Promise<NewsResponse> {
    const params = new URLSearchParams();

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const query = params.toString();
    return apiFetch<NewsResponse>(`/news${query ? `?${query}` : ''}`);
  }

  async function smartSearch(query: string, page = 1, limit = 20): Promise<SmartSearchResponse> {
    return apiFetch<SmartSearchResponse>('/news/smart-search', {
      method: 'POST',
      body: JSON.stringify({ query, page, limit }),
    });
  }

  async function getNewsById(id: string): Promise<NewsItem> {
    return apiFetch<NewsItem>(`/news/${id}`);
  }

  async function createNews(data: CreateNewsDto): Promise<NewsItem> {
    return apiFetch<NewsItem>('/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async function updateNews(id: string, data: Partial<CreateNewsDto>): Promise<NewsItem> {
    return apiFetch<NewsItem>(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async function deleteNews(id: string): Promise<void> {
    return apiFetch(`/news/${id}`, { method: 'DELETE' });
  }

  async function moderateNews(id: string, data: ModerationBody): Promise<NewsItem> {
    return apiFetch<NewsItem>(`/news/${id}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async function likeNews(id: string): Promise<NewsItem> {
    return apiFetch<NewsItem>(`/news/${id}/like`, { method: 'POST' });
  }

  async function toggleFavorite(id: string): Promise<void> {
    return apiFetch(`/news/${id}/favorite`, { method: 'POST' });
  }

  async function getFavorites(): Promise<NewsResponse> {
    return apiFetch<NewsResponse>('/news/favorites');
  }

  async function getStats(): Promise<StatsResponse> {
    return apiFetch<StatsResponse>('/news/stats');
  }

  return {
    getNews,
    smartSearch,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    moderateNews,
    likeNews,
    toggleFavorite,
    getFavorites,
    getStats,
  };
}
