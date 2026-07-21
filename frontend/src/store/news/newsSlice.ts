import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { News, NewsFilter } from '@/types';
import { newsService } from '@/services/newsService';
import type { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';

const selectNewsState = (state: RootState) => state.news;

interface NewsState {
  news: News[];
  currentNews: News | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: NewsFilter;
  personalizedNews: News[];
}

const initialState: NewsState = {
  news: [],
  currentNews: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'publishedAt',
    sortOrder: 'DESC',
  },
  personalizedNews: [],
};

export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (filters: NewsFilter, { rejectWithValue }) => {
    try {
      const response = await newsService.getNews(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch news');
    }
  }
);

export const fetchNewsById = createAsyncThunk(
  'news/fetchNewsById',
  async (id: string, { rejectWithValue }) => {
    try {
      const news = await newsService.getNewsById(id);
      return news;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch news');
    }
  }
);

export const createNews = createAsyncThunk(
  'news/createNews',
  async (data: Partial<News>, { rejectWithValue }) => {
    try {
      const news = await newsService.createNews(data);
      return news;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create news');
    }
  }
);

export const updateNews = createAsyncThunk(
  'news/updateNews',
  async ({ id, data }: { id: string; data: Partial<News> }, { rejectWithValue }) => {
    try {
      const news = await newsService.updateNews(id, data);
      return news;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update news');
    }
  }
);

export const deleteNews = createAsyncThunk(
  'news/deleteNews',
  async (id: string, { rejectWithValue }) => {
    try {
      await newsService.deleteNews(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete news');
    }
  }
);

export const moderateNews = createAsyncThunk(
  'news/moderateNews',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const news = await newsService.moderateNews(id, status);
      return news;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to moderate news');
    }
  }
);

export const likeNews = createAsyncThunk(
  'news/likeNews',
  async (id: string, { rejectWithValue }) => {
    try {
      const news = await newsService.likeNews(id);
      return news;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like news');
    }
  }
);

export const fetchPersonalizedNews = createAsyncThunk(
  'news/fetchPersonalizedNews',
  async (preferences: string[], { rejectWithValue }) => {
    try {
      const response = await newsService.getPersonalizedNews(preferences);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch personalized news');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<NewsFilter>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentNews: (state, action: PayloadAction<News | null>) => {
      state.currentNews = action.payload;
    },
    clearNewsError: (state) => {
      state.error = null;
    },
    resetNews: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch News
    builder
      .addCase(fetchNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
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
      });

    // Fetch News By Id
    builder
      .addCase(fetchNewsById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNewsById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentNews = action.payload;
      })
      .addCase(fetchNewsById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create News
    builder
      .addCase(createNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.news.unshift(action.payload);
      })
      .addCase(createNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update News
    builder
      .addCase(updateNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNews.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.news.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.news[index] = action.payload;
        }
        if (state.currentNews?.id === action.payload.id) {
          state.currentNews = action.payload;
        }
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete News
    builder
      .addCase(deleteNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.news = state.news.filter((item) => item.id !== action.payload);
        if (state.currentNews?.id === action.payload) {
          state.currentNews = null;
        }
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Moderate News
    builder
      .addCase(moderateNews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(moderateNews.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.news.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.news[index] = action.payload;
        }
        if (state.currentNews?.id === action.payload.id) {
          state.currentNews = action.payload;
        }
      })
      .addCase(moderateNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Like News
    builder
      .addCase(likeNews.fulfilled, (state, action) => {
        const index = state.news.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.news[index] = action.payload;
        }
        if (state.currentNews?.id === action.payload.id) {
          state.currentNews = action.payload;
        }
      });

    // Fetch Personalized News
    builder
      .addCase(fetchPersonalizedNews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPersonalizedNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.personalizedNews = action.payload;
      })
      .addCase(fetchPersonalizedNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentNews,
  clearNewsError,  // Экспортируем с новым именем
  resetNews
} = newsSlice.actions;

// Selectors
export const selectNews = (state: RootState) => state.news.news;
export const selectCurrentNews = (state: RootState) => state.news.currentNews;
export const selectNewsLoading = (state: RootState) => state.news.isLoading;
export const selectNewsError = (state: RootState) => state.news.error;
export const selectNewsFilters = (state: RootState) => state.news.filters;
export const selectNewsPagination = createSelector(
  [selectNewsState],
  (news) => ({
    total: news.total,
    page: news.page,
    limit: news.limit,
    totalPages: news.totalPages,
  })
);
export const selectPersonalizedNews = (state: RootState) => state.news.personalizedNews;

export default newsSlice.reducer;