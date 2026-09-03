import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import type { News } from '@/types';

const getNewsByIdMock = vi.fn();
const isLikedMock = vi.fn();
const isFavoritedMock = vi.fn();
const toggleLikeMock = vi.fn();
const toggleFavoriteMock = vi.fn();

vi.mock('@/services/news.service', () => ({
  newsService: {
    getNewsById: (...args: unknown[]) => getNewsByIdMock(...args),
    isLiked: (...args: unknown[]) => isLikedMock(...args),
    isFavorited: (...args: unknown[]) => isFavoritedMock(...args),
    toggleLike: (...args: unknown[]) => toggleLikeMock(...args),
    toggleFavorite: (...args: unknown[]) => toggleFavoriteMock(...args),
  },
}));

import NewsDetailModal from '@/components/news/NewsDetailModal.vue';
import { useAuthStore } from '@/stores/auth';
import { mockNewsItem, mockUser } from '../fixtures/mocks';
import { mountWithProviders } from '../utils/mountWithProviders';

const fullNews: News = {
  ...mockNewsItem,
  content: '<p>Полный текст новости</p>',
  author: 'Test Author',
  imageUrl: 'https://example.com/image.jpg',
};

function mountModal() {
  return mountWithProviders(NewsDetailModal, {
    stubVuetify: true,
    props: { news: mockNewsItem },
  });
}

function setAuthenticated() {
  const store = useAuthStore();
  store.accessToken = 'test-token';
  store.user = mockUser;
  localStorage.setItem('accessToken', 'test-token');
}

describe('NewsDetailModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    getNewsByIdMock.mockReset();
    isLikedMock.mockReset();
    isFavoritedMock.mockReset();
    toggleLikeMock.mockReset();
    toggleFavoriteMock.mockReset();
    getNewsByIdMock.mockResolvedValue(fullNews);
    isLikedMock.mockResolvedValue(false);
    isFavoritedMock.mockResolvedValue(false);
  });

  it('shows loader then renders fetched news', async () => {
    let resolveFetch!: (value: News) => void;
    getNewsByIdMock.mockReturnValue(
      new Promise<News>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const wrapper = mountModal();
    expect(wrapper.find('.v-progress-circular').exists()).toBe(true);

    resolveFetch(fullNews);
    await flushPromises();

    expect(getNewsByIdMock).toHaveBeenCalledWith(mockNewsItem.id);
    expect(wrapper.text()).toContain(fullNews.title);
    expect(wrapper.text()).toContain(fullNews.summary!);
    expect(wrapper.text()).toContain('AI-рерайт новости');
  });

  it('shows original label for non-AI news', async () => {
    getNewsByIdMock.mockResolvedValue({ ...fullNews, isAiGenerated: false });

    const wrapper = mountModal();
    await flushPromises();

    expect(wrapper.text()).toContain('Оригинальная новость');
  });

  it('prompts guest to login on like', async () => {
    const wrapper = mountModal();
    await flushPromises();

    const likeButton = wrapper.findAll('.v-btn').find((btn) => btn.text().includes(String(mockNewsItem.likes)));
    expect(likeButton).toBeDefined();
    await likeButton!.trigger('click');

    expect(toggleLikeMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Войдите, чтобы ставить лайки');
  });

  it('toggles like for authenticated user', async () => {
    setAuthenticated();
    toggleLikeMock.mockResolvedValue({ liked: true, likes: 5 });

    const wrapper = mountModal();
    await flushPromises();

    const likeButton = wrapper.findAll('.v-btn').find((btn) => btn.text().includes(String(mockNewsItem.likes)));
    await likeButton!.trigger('click');
    await flushPromises();

    expect(toggleLikeMock).toHaveBeenCalledWith(mockNewsItem.id);
    expect(wrapper.text()).toContain('5');
  });

  it('prompts guest to login on favorite', async () => {
    const wrapper = mountModal();
    await flushPromises();

    const favoriteButton = wrapper.findAll('.v-btn').find((btn) => btn.text().includes('В избранное'));
    expect(favoriteButton).toBeDefined();
    await favoriteButton!.trigger('click');

    expect(toggleFavoriteMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Войдите, чтобы добавлять в избранное');
  });

  it('toggles favorite for authenticated user', async () => {
    setAuthenticated();
    toggleFavoriteMock.mockResolvedValue({ favorited: true });

    const wrapper = mountModal();
    await flushPromises();

    const favoriteButton = wrapper.findAll('.v-btn').find((btn) => btn.text().includes('В избранное'));
    await favoriteButton!.trigger('click');
    await flushPromises();

    expect(toggleFavoriteMock).toHaveBeenCalledWith(mockNewsItem.id);
    expect(wrapper.text()).toContain('В избранном');
  });

  it('copies share link when native share is unavailable', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error('unsupported')),
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock },
    });

    const wrapper = mountModal();
    await flushPromises();

    const shareButton = wrapper.findAll('.v-btn').find((btn) => btn.text().includes('Поделиться'));
    await shareButton!.trigger('click');
    await flushPromises();

    expect(navigator.share).toHaveBeenCalled();
    expect(writeTextMock).toHaveBeenCalledWith(`${window.location.origin}/?news=${mockNewsItem.id}`);
    expect(wrapper.text()).toContain('Ссылка скопирована');
  });

  it('emits close when close button clicked', async () => {
    const wrapper = mountModal();
    await flushPromises();

    const closeButton = wrapper.findAll('.v-btn').find((btn) => btn.text().includes('Закрыть'));
    await closeButton!.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')!.length).toBeGreaterThanOrEqual(1);
  });
});
