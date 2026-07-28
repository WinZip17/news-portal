import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useNewsModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const newsId = searchParams.get('news');
    if (newsId && !selectedNewsId) {
      setSelectedNewsId(newsId);
      setModalVisible(true);
    }
  }, []);

  const openNews = useCallback(
    (newsId: string) => {
      setModalVisible(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('news', newsId);
      setSearchParams(newParams);
      setSelectedNewsId(newsId);
    },
    [searchParams, setSearchParams],
  );

  const closeNews = useCallback(() => {
    setModalVisible(false);
    setSelectedNewsId(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('news');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return {
    selectedNewsId,
    modalVisible,
    openNews,
    closeNews,
  };
};
