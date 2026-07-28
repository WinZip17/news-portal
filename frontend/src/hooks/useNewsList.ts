import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNews } from '@/hooks/useNews.ts';
import { NewsCategory, NewsFilter } from '@/types';

export const useNewsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchNews, setFilters } = useNews();
  const [initialLoading, setInitialLoading] = useState(true);
  const hasActiveFilters = searchParams.toString().length > 0;

  useEffect(() => {
    const urlFilters: NewsFilter = {};

    const category = searchParams.get('category');
    urlFilters.category = category && category !== 'all' ? (category as NewsCategory) : undefined;

    const search = searchParams.get('search');
    urlFilters.search = search || undefined;

    const page = searchParams.get('page');
    urlFilters.page = page ? parseInt(page, 10) : undefined;

    const sortBy = searchParams.get('sortBy');
    urlFilters.sortBy = (sortBy as 'createdAt' | 'views' | 'likes' | 'publishedAt') || undefined;

    const isAiGenerated = searchParams.get('isAiGenerated');
    urlFilters.isAiGenerated = isAiGenerated && isAiGenerated !== 'all' ? isAiGenerated === 'true' : undefined;

    setFilters(urlFilters);
    fetchNews(urlFilters).then(() => {
      if (initialLoading) setInitialLoading(false);
    });
  }, [searchParams]);

  const handleSearch = useCallback(
    (value: string) => {
      const p = new URLSearchParams(searchParams);
      value ? p.set('search', value) : p.delete('search');
      p.delete('page');
      setSearchParams(p);
    },
    [searchParams],
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      const p = new URLSearchParams(searchParams);
      category !== 'all' ? p.set('category', category) : p.delete('category');
      p.delete('page');
      setSearchParams(p);
    },
    [searchParams],
  );

  const handleSortChange = useCallback(
    (sortBy: string) => {
      const p = new URLSearchParams(searchParams);
      sortBy !== 'publishedAt' ? p.set('sortBy', sortBy) : p.delete('sortBy');
      p.delete('page');
      setSearchParams(p);
    },
    [searchParams],
  );

  const handleAiFilterChange = useCallback(
    (value: string) => {
      const p = new URLSearchParams(searchParams);
      value !== 'all' ? p.set('isAiGenerated', value) : p.delete('isAiGenerated');
      p.delete('page');
      setSearchParams(p);
    },
    [searchParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const p = new URLSearchParams(searchParams);
      p.set('page', page.toString());
      setSearchParams(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [searchParams],
  );

  const handleClearFilters = useCallback(() => setSearchParams({}), []);

  return {
    hasActiveFilters,
    searchParams,
    initialLoading,
    handleSearch,
    handleCategoryChange,
    handleSortChange,
    handleAiFilterChange,
    handlePageChange,
    handleClearFilters,
  };
};
