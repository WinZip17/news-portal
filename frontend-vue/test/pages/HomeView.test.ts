import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';

const getNewsMock = vi.fn();
const getStatsMock = vi.fn();
const getNewsByIdMock = vi.fn();

vi.mock('@/services/news.service', () => ({
  newsService: {
    getNews: (...args: unknown[]) => getNewsMock(...args),
    getStats: (...args: unknown[]) => getStatsMock(...args),
    getNewsById: (...args: unknown[]) => getNewsByIdMock(...args),
  },
}));

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}));

import HomeLayout from '@/layouts/HomeLayout.vue';
import HomeView from '@/pages/HomeView.vue';
import { useAuthStore } from '@/stores/auth';
import { mockNewsItem, mockStats, mockUser } from '../fixtures/mocks';
import { mountWithProviders } from '../utils/mountWithProviders';

const layoutStubs = {
  VDialog: {
    template: '<div v-if="modelValue" class="v-dialog" role="dialog"><slot /></div>',
    props: ['modelValue', 'maxWidth'],
  },
};

function createNewsWithImages(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockNewsItem,
    id: `news-${i + 1}`,
    title: `Новость ${i + 1}`,
    imageUrl: `https://example.com/${i + 1}.jpg`,
  }));
}

function createHomeRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: HomeView },
      { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
      { path: '/register', name: 'register', component: { template: '<div>Register</div>' } },
      { path: '/news', name: 'news', component: { template: '<div>News</div>' } },
    ],
  });
}

function setAuthenticated() {
  const store = useAuthStore();
  store.accessToken = 'test-token';
  store.user = mockUser;
  localStorage.setItem('accessToken', 'test-token');
}

async function mountHomePage() {
  const router = createHomeRouter();
  await router.push('/');
  await router.isReady();
  const wrapper = mountWithProviders(HomeLayout, {
    router,
    slots: { default: '<RouterView />' },
    global: { stubs: layoutStubs },
  });
  await flushPromises();
  return { wrapper, router };
}

describe('HomeView (newspaper)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    getNewsMock.mockReset();
    getStatsMock.mockReset();
    getNewsByIdMock.mockReset();
    getStatsMock.mockResolvedValue(mockStats);
    getNewsByIdMock.mockResolvedValue(mockNewsItem);
    getNewsMock.mockResolvedValue({
      data: createNewsWithImages(15),
      total: 15,
      page: 1,
      limit: 30,
      totalPages: 1,
    });
  });

  it('renders newspaper masthead and navigation', async () => {
    const { wrapper } = await mountHomePage();

    expect(wrapper.text()).toContain('Short News');
    expect(wrapper.text()).toContain('Лента');
    expect(wrapper.text()).toContain('Умный поиск');
    expect(wrapper.text()).toContain('Войти');
  });

  it('shows registration link for guest', async () => {
    const { wrapper } = await mountHomePage();

    expect(wrapper.text()).toContain('Регистрация');
  });

  it('shows profile link for authenticated user', async () => {
    setAuthenticated();
    const { wrapper } = await mountHomePage();

    expect(wrapper.text()).toContain('Профиль');
    expect(wrapper.text()).toContain('Читать ленту');
  });

  it('loads news with images and renders lead story', async () => {
    const { wrapper } = await mountHomePage();

    expect(getNewsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 30,
        sortBy: 'publishedAt',
        sortOrder: 'DESC',
      }),
    );
    expect(getStatsMock).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Новость 1');
    expect(wrapper.text()).toContain('Коротко');
    expect(wrapper.text()).toContain(String(mockStats.totalNews));
  });

  it('navigates to news feed from nav', async () => {
    const { wrapper, router } = await mountHomePage();

    const lentaButton = wrapper
      .findAll('.newspaper-nav button.newspaper-link')
      .find((btn) => btn.text().includes('Лента'));
    await lentaButton!.trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/news');
  });

  it('opens detail dialog when lead story is clicked', async () => {
    const { wrapper } = await mountHomePage();

    await wrapper.find('.newspaper-lead').trigger('click');
    await flushPromises();

    expect(wrapper.find('.v-dialog').exists()).toBe(true);
    expect(wrapper.text()).toContain(mockNewsItem.title);
  });

  it('shows empty state when no news with images', async () => {
    getNewsMock.mockResolvedValue({
      data: [{ ...mockNewsItem, imageUrl: undefined }],
      total: 1,
      page: 1,
      limit: 30,
      totalPages: 1,
    });

    const { wrapper } = await mountHomePage();

    expect(wrapper.text()).toContain('Нет опубликованных материалов с фотографиями');
  });
});
