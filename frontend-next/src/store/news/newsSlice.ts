import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { newsService } from '@/services/newsService';
import type { News, NewsResponse, NewsStats, SmartSearchResponse, NewsFilter } from '@/types';
import { formatAppliedFilters } from '@/utils/formatAppliedFilters';

interface FetchNewsArg {
  params?: NewsFilter;
  append?: boolean;
}

interface SmartSearchArg {
  query: string;
  page?: number;
  limit?: number;
  append?: boolean;
}

interface NewsState {
  news: News[];
  currentNews: News | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  currentNewsLoading: boolean;
  statsLoading: boolean;
  error: string | null;
  stats: NewsStats;
  searchHint: string | null;
  searchSource: 'ai' | 'fallback' | null;
  isLiked: boolean;
  isFavorited: boolean;
}

const initialState: NewsState = {
  news: [],
  currentNews: null,
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,
  currentNewsLoading: false,
  statsLoading: false,
  error: null,
  stats: {
    newsToday: 0,
    totalUsers: 0,
    totalAiNews: 0,
    totalNews: 0,
    pendingNews: 0,
    totalViews: 0,
    newsLastHour: 0,
    activeSources: 0,
    categoriesCount: 0,
  },
  searchHint: null,
  searchSource: null,
  isLiked: false,
  isFavorited: false,
};

function applyNewsResponse(state: NewsState, response: NewsResponse, append: boolean) {
  state.news = append ? [...state.news, ...response.data] : response.data;
  state.total = response.total;
  state.page = response.page;
  state.limit = response.limit;
  state.totalPages = response.totalPages;
  state.hasMore = response.page * response.limit < response.total;
}

export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async ({ params, append = false }: FetchNewsArg = {}, { rejectWithValue }) => {
    try {
      const response = await newsService.getNews(params);
      return { response, append };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch news');
    }
  },
);

export const fetchNewsById = createAsyncThunk(
  'news/fetchNewsById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await newsService.getNewsById(id);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch news');
    }
  },
);

export const fetchStats = createAsyncThunk('news/fetchStats', async (_, { rejectWithValue }) => {
  try {
    return await newsService.getStats();
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch stats');
  }
});

export const smartSearch = createAsyncThunk(
  'news/smartSearch',
  async ({ query, page = 1, limit = 20, append = false }: SmartSearchArg, { rejectWithValue }) => {
    try {
      const response = await newsService.smartSearch(query, page, limit);
      return { response, append };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to perform search');
    }
  },
);

export const checkNewsInteraction = createAsyncThunk(
  'news/checkNewsInteraction',
  async (id: string, { rejectWithValue, getState }) => {
    const accessToken = (getState() as { auth: { accessToken: string | null } }).auth.accessToken;
    if (!accessToken) {
      return { isLiked: false, isFavorited: false };
    }

    try {
      const [isLiked, isFavorited] = await Promise.all([
        newsService.isLiked(id),
        newsService.isFavorited(id),
      ]);
      return { isLiked, isFavorited };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to check interaction');
    }
  },
);

export const toggleLike = createAsyncThunk(
  'news/toggleLike',
  async (id: string, { rejectWithValue }) => {
    try {
      return { id, ...(await newsService.toggleLike(id)) };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to toggle like');
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  'news/toggleFavorite',
  async (id: string, { rejectWithValue }) => {
    try {
      return { id, ...(await newsService.toggleFavorite(id)) };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to toggle favorite');
    }
  },
);

function applySmartSearchResponse(
  state: NewsState,
  response: SmartSearchResponse,
  append: boolean,
) {
  applyNewsResponse(state, response, append);
  state.searchHint = formatAppliedFilters(response.appliedFilters) || null;
  state.searchSource = response.source;
}

function syncNewsInList(state: NewsState, id: string, patch: Partial<News>) {
  const index = state.news.findIndex((item) => item.id === id);
  if (index !== -1) {
    state.news[index] = { ...state.news[index], ...patch };
  }
}

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setCurrentNews: (state, action: PayloadAction<News | null>) => {
      state.currentNews = action.payload;
      state.isLiked = false;
      state.isFavorited = false;
      state.currentNewsLoading = false;
    },
    clearSearchMeta: (state) => {
      state.searchHint = null;
      state.searchSource = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        applyNewsResponse(state, action.payload.response, action.payload.append);
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload as string;
      })
      .addCase(fetchNewsById.pending, (state) => {
        state.currentNewsLoading = true;
      })
      .addCase(fetchNewsById.fulfilled, (state, action: PayloadAction<News>) => {
        state.currentNewsLoading = false;
        state.currentNews = action.payload;
      })
      .addCase(fetchNewsById.rejected, (state, action) => {
        state.currentNewsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchStats.fulfilled, (state, action: PayloadAction<NewsStats>) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state) => {
        state.statsLoading = false;
      })
      .addCase(smartSearch.pending, (state, action) => {
        if (action.meta.arg.append) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(smartSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        applySmartSearchResponse(state, action.payload.response, action.payload.append);
      })
      .addCase(smartSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload as string;
        if (!action.meta.arg.append) {
          state.news = [];
          state.hasMore = false;
          state.searchHint = null;
          state.searchSource = null;
        }
      })
      .addCase(checkNewsInteraction.fulfilled, (state, action) => {
        state.isLiked = action.payload.isLiked;
        state.isFavorited = action.payload.isFavorited;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.isLiked = action.payload.liked;
        if (state.currentNews?.id === action.payload.id) {
          state.currentNews.likes = action.payload.likes;
        }
        syncNewsInList(state, action.payload.id, { likes: action.payload.likes });
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.isFavorited = action.payload.favorited;
      });
  },
});

export const { setCurrentNews, clearSearchMeta } = newsSlice.actions;
export default newsSlice.reducer;
