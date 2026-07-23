import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { newsService } from '@/services/newsService';
import type { News, NewsResponse } from '@/types';

interface NewsState {
  news: News[];
  currentNews: News | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NewsState = {
  news: [],
  currentNews: null,
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
  isLoading: false,
  error: null,
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
      });
  },
});

export const { setCurrentNews } = newsSlice.actions;
export default newsSlice.reducer;
