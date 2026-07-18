import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchNews,
  fetchNewsById,
  createNews,
  updateNews,
  deleteNews,
  moderateNews,
  likeNews,
  fetchPersonalizedNews,
  setFilters,
  clearNewsError,  // Обновленное имя
  selectNews,
  selectCurrentNews,
  selectNewsLoading,
  selectNewsError,
  selectNewsFilters,
  selectNewsPagination,
  selectPersonalizedNews,
} from '../store';
import { News, NewsFilter } from "../types";

export const useNews = () => {
  const dispatch = useAppDispatch();
  const news = useAppSelector(selectNews);
  const currentNews = useAppSelector(selectCurrentNews);
  const isLoading = useAppSelector(selectNewsLoading);
  const error = useAppSelector(selectNewsError);
  const filters = useAppSelector(selectNewsFilters);
  const pagination = useAppSelector(selectNewsPagination);
  const personalizedNews = useAppSelector(selectPersonalizedNews);

  const handleFetchNews = useCallback(
    (filterParams?: NewsFilter) => {
      const params = { ...filters, ...filterParams };
      dispatch(setFilters(params));
      return dispatch(fetchNews(params)).unwrap();
    },
    [dispatch, filters]
  );

  const handleFetchNewsById = useCallback(
    (id: string) => {
      return dispatch(fetchNewsById(id)).unwrap();
    },
    [dispatch]
  );

  const handleCreateNews = useCallback(
    (data: Partial<News>) => {
      return dispatch(createNews(data)).unwrap();
    },
    [dispatch]
  );

  const handleUpdateNews = useCallback(
    (id: string, data: Partial<News>) => {
      return dispatch(updateNews({ id, data })).unwrap();
    },
    [dispatch]
  );

  const handleDeleteNews = useCallback(
    (id: string) => {
      return dispatch(deleteNews(id)).unwrap();
    },
    [dispatch]
  );

  const handleModerateNews = useCallback(
    (id: string, status: string) => {
      return dispatch(moderateNews({ id, status })).unwrap();
    },
    [dispatch]
  );

  const handleLikeNews = useCallback(
    (id: string) => {
      return dispatch(likeNews(id)).unwrap();
    },
    [dispatch]
  );

  const handleFetchPersonalizedNews = useCallback(
    (preferences: string[]) => {
      return dispatch(fetchPersonalizedNews(preferences)).unwrap();
    },
    [dispatch]
  );

  const handleSetFilters = useCallback(
    (newFilters: NewsFilter) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearNewsError());  // Используем новое имя
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
    fetchNews: handleFetchNews,
    fetchNewsById: handleFetchNewsById,
    createNews: handleCreateNews,
    updateNews: handleUpdateNews,
    deleteNews: handleDeleteNews,
    moderateNews: handleModerateNews,
    likeNews: handleLikeNews,
    fetchPersonalizedNews: handleFetchPersonalizedNews,
    setFilters: handleSetFilters,
    clearError: handleClearError,
    loadMore,
  };
};