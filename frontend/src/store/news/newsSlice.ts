import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { News, NewsFilter, NewsResponse, NewsStats } from '@/types';
import { newsService } from '@/services/newsService';
import type { RootState } from '@/store';
import { AxiosError } from 'axios';

const selectNewsState = (state: RootState) => state.news;

interface NewsState {
  news: News[];
  currentNews: News | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;
  errorStats: string | null;
  filters: NewsFilter;
  personalizedNews: News[];
  stats: NewsStats | null;
  initialLoading: boolean;
}

interface ApiErrorResponse {
  message: string;
}

const initialState: NewsState = {
  news: [],
  currentNews: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  isLoadingStats: false,
  error: null,
  errorStats: null,
  filters: {},
  personalizedNews: [],
  stats: null,
  initialLoading: true,
};

const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorResponse)?.message || 'Request failed';
  }
  return error instanceof Error ? error.message : 'Unknown error';
};

export const fetchNews = createAsyncThunk<NewsResponse, void>('news/fetchNews', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    return await newsService.getNews(state.news.filters);
  } catch (error: unknown) {
    return rejectWithValue(handleApiError(error));
  }
});

export const fetchNewsById = createAsyncThunk<News, string>('news/fetchNewsById', async (id, { rejectWithValue }) => {
  try {
    return await newsService.getNewsById(id);
  } catch (error: unknown) {
    return rejectWithValue(handleApiError(error));
  }
});

export const fetchStats = createAsyncThunk<NewsStats>('news/getStats', async (_, { rejectWithValue }) => {
  try {
    return await newsService.getStats();
  } catch (error: unknown) {
    return rejectWithValue(handleApiError(error));
  }
});

export const createNews = createAsyncThunk<News, Partial<News>>('news/createNews', async (data, { rejectWithValue }) => {
  try {
    return await newsService.createNews(data);
  } catch (error: unknown) {
    return rejectWithValue(handleApiError(error));
  }
});

export const updateNews = createAsyncThunk<News, { id: string; data: Partial<News> }>(
  'news/updateNews',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await newsService.updateNews(id, data);
    } catch (error: unknown) {
      return rejectWithValue(handleApiError(error));
    }
  },
);

export const deleteNews = createAsyncThunk<string, string>('news/deleteNews', async (id, { rejectWithValue }) => {
  try {
    await newsService.deleteNews(id);
    return id;
  } catch (error: unknown) {
    return rejectWithValue(handleApiError(error));
  }
});

export const moderateNews = createAsyncThunk<News, { id: string; status: string }>(
  'news/moderateNews',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await newsService.moderateNews(id, status);
    } catch (error: unknown) {
      return rejectWithValue(handleApiError(error));
    }
  },
);

export const likeNews = createAsyncThunk<News, string>('news/likeNews', async (id, { rejectWithValue }) => {
  try {
    return await newsService.likeNews(id);
  } catch (error: unknown) {
    return rejectWithValue(handleApiError(error));
  }
});

export const fetchPersonalizedNews = createAsyncThunk<News[], string[]>('news/fetchPersonalizedNews', async (preferences, { rejectWithValue }) => {
  try {
    const response = await newsService.getPersonalizedNews(preferences);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(handleApiError(error));
  }
});

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<NewsFilter>>) => {
      state.filters = { ...state.filters, ...action.payload, page: undefined };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    setSearch: (state, action: PayloadAction<string | undefined>) => {
      state.filters.search = action.payload || undefined;
      state.filters.page = undefined;
    },
    setCategory: (state, action: PayloadAction<string | undefined>) => {
      state.filters.category = action.payload as NewsFilter['category'];
      state.filters.page = undefined;
    },
    setSortBy: (state, action: PayloadAction<string | undefined>) => {
      state.filters.sortBy = action.payload as NewsFilter['sortBy'];
      state.filters.page = undefined;
    },
    setAiFilter: (state, action: PayloadAction<boolean | undefined>) => {
      state.filters.isAiGenerated = action.payload;
      state.filters.page = undefined;
    },
    clearFilters: (state) => {
      state.filters = {};
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
        state.initialLoading = false;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.initialLoading = false;
      });

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

    builder
      .addCase(fetchStats.pending, (state) => {
        state.isLoadingStats = true;
        state.errorStats = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.errorStats = action.payload as string;
      });

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

    builder
      .addCase(updateNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNews.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.news.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.news[index] = action.payload;
        if (state.currentNews?.id === action.payload.id) state.currentNews = action.payload;
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.news = state.news.filter((item) => item.id !== action.payload);
        if (state.currentNews?.id === action.payload) state.currentNews = null;
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(moderateNews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(moderateNews.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.news.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.news[index] = action.payload;
        if (state.currentNews?.id === action.payload.id) state.currentNews = action.payload;
      })
      .addCase(moderateNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(likeNews.fulfilled, (state, action) => {
      const index = state.news.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) state.news[index] = action.payload;
      if (state.currentNews?.id === action.payload.id) state.currentNews = action.payload;
    });

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

export const { setFilter, setPage, setSearch, setCategory, setSortBy, setAiFilter, clearFilters, setCurrentNews, clearNewsError, resetNews } =
  newsSlice.actions;

export const selectNews = (state: RootState) => state.news.news;
export const selectCurrentNews = (state: RootState) => state.news.currentNews;
export const selectNewsLoading = (state: RootState) => state.news.isLoading;
export const selectNewsError = (state: RootState) => state.news.error;
export const selectNewsFilters = (state: RootState) => state.news.filters;
export const selectInitialLoading = (state: RootState) => state.news.initialLoading;
export const selectNewsPagination = createSelector([selectNewsState], (news) => ({
  total: news.total,
  page: news.page,
  limit: news.limit,
  totalPages: news.totalPages,
}));
export const selectPersonalizedNews = (state: RootState) => state.news.personalizedNews;
export const selectStats = (state: RootState) => state.news.stats;
export const selectStatsLoading = (state: RootState) => state.news.isLoadingStats;

export default newsSlice.reducer;
