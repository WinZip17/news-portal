import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';

const getNewsMock = vi.fn();
const getStatsMock = vi.fn();

vi.mock('@/services/news.service', () => ({
  newsService: {
    getNews: (...args: unknown[]) => getNewsMock(...args),
    getStats: (...args: unknown[]) => getStatsMock(...args),
  },
}));

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}));

const newsCardStub = vi.hoisted(() => ({
  template: '<article class="news-card" @click="$emit(\'click\')">{{ item.title }}</article>',
  props: ['item', 'categoryColor', 'categoryLabel', 'formattedDate'],
}));

vi.mock('@/components/news/NewsCard.vue', () => ({
  default: newsCardStub,
}));

vi.mock('@/components/news/NewsDetailModal.vue', () => ({
  default: {
    template: '<div class="news-detail-modal" />',
    props: ['news'],
  },
}));

import HomeView from '@/pages/HomeView.vue';
import { useAuthStore } from '@/stores/auth';
import { mockNewsItem, mockNewsResponse, mockStats, mockUser } from '../fixtures/mocks';
import { mountWithProviders } from '../utils/mountWithProviders';

const homeStubs = {
  VSheet: { template: '<div class="v-sheet"><slot /></div>' },
  VBtn: {
    template: '<button type="button" class="v-btn" @click="$emit(\'click\')"><slot /></button>',
    props: ['size', 'color', 'variant', 'prependIcon', 'appendIcon'],
  },
  VRow: { template: '<div class="v-row"><slot /></div>', props: ['class'] },
  VCol: {
    template: '<div class="v-col"><slot /></div>',
    props: ['cols', 'sm', 'md', 'lg', 'xl'],
  },
  VCard: {
    template: '<div class="v-card"><slot /></div>',
    props: ['variant'],
  },
  VCardText: { template: '<div class="v-card-text"><slot /></div>' },
  VIcon: { template: '<span class="v-icon" />', props: ['icon', 'color'] },
  VSkeletonLoader: { template: '<div class="v-skeleton-loader" />', props: ['type'] },
  VDialog: {
    template: '<div v-if="modelValue" class="v-dialog"><slot /></div>',
    props: ['modelValue', 'maxWidth'],
  },
};

function createHomeRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
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

function findButton(wrapper: ReturnType<typeof mountWithProviders>, label: string) {
  return wrapper.findAll('.v-btn').find((btn) => btn.text().includes(label));
}

async function mountHome() {
  const router = createHomeRouter();
  await router.push('/');
  await router.isReady();
  const wrapper = mountWithProviders(HomeView, {
    router,
    global: { stubs: homeStubs },
  });
  await flushPromises();
  return { wrapper, router };
}

describe('HomeView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    getNewsMock.mockReset();
    getStatsMock.mockReset();
    getNewsMock.mockResolvedValue(mockNewsResponse);
    getStatsMock.mockResolvedValue(mockStats);
  });

  it('renders hero section for guest with auth CTAs', async () => {
    const { wrapper } = await mountHome();

    expect(wrapper.text()).toContain('News Portal');
    expect(findButton(wrapper, 'Начать бесплатно')).toBeDefined();
    expect(findButton(wrapper, 'Войти')).toBeDefined();
    expect(findButton(wrapper, 'Читать новости')).toBeUndefined();
  });

  it('shows read news CTA for authenticated user', async () => {
    setAuthenticated();
    const { wrapper } = await mountHome();

    expect(findButton(wrapper, 'Читать новости')).toBeDefined();
    expect(findButton(wrapper, 'Начать бесплатно')).toBeUndefined();
    expect(findButton(wrapper, 'Войти')).toBeUndefined();
  });

  it('loads stats and latest news from API', async () => {
    const { wrapper } = await mountHome();

    expect(getNewsMock).toHaveBeenCalled();
    expect(getStatsMock).toHaveBeenCalled();
    expect(wrapper.text()).toContain(String(mockStats.totalNews));
    expect(wrapper.text()).toContain(String(mockStats.newsToday));
    expect(wrapper.text()).toContain(mockNewsItem.title);
    expect(wrapper.text()).toContain('Последние новости');
    expect(findButton(wrapper, 'Все новости')).toBeDefined();
  });

  it('navigates to register from hero CTA', async () => {
    const { wrapper, router } = await mountHome();

    await findButton(wrapper, 'Начать бесплатно')!.trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/register');
  });

  it('navigates to news feed from all news button', async () => {
    const { wrapper, router } = await mountHome();

    await findButton(wrapper, 'Все новости')!.trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/news');
  });

  it('opens news modal when card is clicked', async () => {
    const { wrapper } = await mountHome();

    await wrapper.find('.news-card').trigger('click');
    await flushPromises();

    expect(wrapper.find('.v-dialog').exists()).toBe(true);
    expect(wrapper.find('.news-detail-modal').exists()).toBe(true);
  });

  it('shows empty message when news list is empty', async () => {
    getNewsMock.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    });

    const { wrapper } = await mountHome();

    expect(wrapper.text()).toContain('Новости пока не загружены');
  });
});
