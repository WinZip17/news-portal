import { useCallback } from 'react';
import {
  fetchNews,
  fetchNewsById,
  createNews,
  updateNews,
  deleteNews,
  moderateNews,
  likeNews,
  fetchPersonalizedNews,
  setFilter,
  clearNewsError,
  selectNews,
  selectCurrentNews,
  selectNewsLoading,
  selectNewsError,
  selectNewsFilters,
  selectNewsPagination,
  selectPersonalizedNews,
  setSearch,
  setCategory,
  setSortBy,
  setAiFilter,
  clearFilters,
  setPage,
  selectInitialLoading,
  fetchStats,
  selectStats,
  selectStatsLoading,
  useAppDispatch,
  useAppSelector,
  setCurrentNews,
} from '@/store';
import type { News, NewsFilter } from '@/types';

export const useNews = () => {
  const dispatch = useAppDispatch();
  const news = useAppSelector(selectNews);
  const currentNews = useAppSelector(selectCurrentNews);
  const isLoading = useAppSelector(selectNewsLoading);
  const error = useAppSelector(selectNewsError);
  const filters = useAppSelector(selectNewsFilters);
  const pagination = useAppSelector(selectNewsPagination);
  const personalizedNews = useAppSelector(selectPersonalizedNews);
  const stats = useAppSelector(selectStats);
  const isLoadingStats = useAppSelector(selectStatsLoading);

  const handleFetchNews = useCallback(
    (filterParams?: NewsFilter) => {
      const params = { ...filters, ...filterParams };
      dispatch(setFilter(params));
      return dispatch(fetchNews()).unwrap();
    },
    [dispatch, filters],
  );

  const handleFetchNewsById = useCallback(
    (id: string) => {
      return dispatch(fetchNewsById(id)).unwrap();
    },
    [dispatch],
  );

  const handleFetchStats = useCallback(() => {
    return dispatch(fetchStats()).unwrap();
  }, [dispatch]);

  const handleCreateNews = useCallback(
    (data: Partial<News>) => {
      return dispatch(createNews(data)).unwrap();
    },
    [dispatch],
  );

  const handleUpdateNews = useCallback(
    (id: string, data: Partial<News>) => {
      return dispatch(updateNews({ id, data })).unwrap();
    },
    [dispatch],
  );

  const handleDeleteNews = useCallback(
    (id: string) => {
      return dispatch(deleteNews(id)).unwrap();
    },
    [dispatch],
  );

  const handleModerateNews = useCallback(
    (id: string, status: string) => {
      return dispatch(moderateNews({ id, status })).unwrap();
    },
    [dispatch],
  );

  const handleLikeNews = useCallback(
    (id: string) => {
      return dispatch(likeNews(id)).unwrap();
    },
    [dispatch],
  );

  const handleFetchPersonalizedNews = useCallback(
    (preferences: string[]) => {
      return dispatch(fetchPersonalizedNews(preferences)).unwrap();
    },
    [dispatch],
  );

  const handleSetFilters = useCallback(
    (newFilters: NewsFilter) => {
      dispatch(setFilter(newFilters));
    },
    [dispatch],
  );

  const handleClearError = useCallback(() => {
    dispatch(clearNewsError()); // Используем новое имя
  }, [dispatch]);

  const handleSetCurrentNews = useCallback(() => {
    dispatch(setCurrentNews(null));
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      handleFetchNews({ page: pagination.page + 1 });
    }
  }, [pagination, handleFetchNews]);

  return {
    news,
    currentNews,
    isLoading,
    error,
    filters,
    pagination,
    personalizedNews,
    stats,
    isLoadingStats,
    initialLoading: useAppSelector(selectInitialLoading),
    fetchNews: handleFetchNews,
    fetchStats: handleFetchStats,
    fetchNewsById: handleFetchNewsById,
    createNews: handleCreateNews,
    updateNews: handleUpdateNews,
    deleteNews: handleDeleteNews,
    moderateNews: handleModerateNews,
    likeNews: handleLikeNews,
    fetchPersonalizedNews: handleFetchPersonalizedNews,
    setFilters: handleSetFilters,
    clearError: handleClearError,
    setCurrentNews: handleSetCurrentNews,
    loadMore,
    setSearch: (v: string) => dispatch(setSearch(v || undefined)),
    setCategory: (v: string) => dispatch(setCategory(v !== 'all' ? v : undefined)),
    setSortBy: (v: string) => dispatch(setSortBy(v !== 'publishedAt' ? v : undefined)),
    setAiFilter: (v: string) => {
      if (v === 'all') dispatch(setAiFilter(undefined));
      else dispatch(setAiFilter(v === 'true'));
    },
    clearAllFilters: () => dispatch(clearFilters()),
    setPage: (p: number) => dispatch(setPage(p)),
  };
};
