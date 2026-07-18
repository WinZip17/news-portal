import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useNewsModal = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // При загрузке проверяем URL параметр
    useEffect(() => {
        const newsId = searchParams.get('news');
        if (newsId) {
            setSelectedNewsId(newsId);
            setModalVisible(true);
        }
    }, []);

    // Открыть модалку и обновить URL
    const openNews = useCallback((newsId: string) => {
        setSelectedNewsId(newsId);
        setModalVisible(true);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('news', newsId);
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // Закрыть модалку и убрать news из URL
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