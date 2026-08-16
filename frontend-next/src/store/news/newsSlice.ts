import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { newsService } from '@/services/newsService';
import type { News, NewsResponse, NewsStats } from '@/types';

interface NewsState {
  news: News[];
  currentNews: News | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  statsLoading: boolean;
  error: string | null;
  stats: NewsStats;
}

const initialState: NewsState = {
  news: [],
  currentNews: null,
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
  isLoading: false,
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
};

export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (params: Record<string, string | number> | undefined, { rejectWithValue }) => {
    try {
      return await newsService.getNews(params);
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
    const response = await newsService.getStats();
    return response;
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch stats');
  }
});

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setCurrentNews: (state, action: PayloadAction<News | null>) => {
      state.currentNews = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNews.fulfilled, (state, action: PayloadAction<NewsResponse>) => {
        state.isLoading = false;
        state.news = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchNewsById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNewsById.fulfilled, (state, action: PayloadAction<News>) => {
        state.isLoading = false;
        state.currentNews = action.payload;
      })
      .addCase(fetchNewsById.rejected, (state, action) => {
        state.isLoading = false;
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
      });
  },
});

export const { setCurrentNews } = newsSlice.actions;
export default newsSlice.reducer;
