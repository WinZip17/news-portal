import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

const getNewsMock = vi.fn();

vi.mock('@/services/news.service', () => ({
  newsService: {
    getNews: (...args: unknown[]) => getNewsMock(...args),
    getStats: vi.fn(),
  },
}));

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}));

const newsCardStub = vi.hoisted(() => ({
  template: '<article class="news-card" @click="$emit(\'click\')">{{ item.title }}</article>',
  props: ['item', 'categoryColor', 'categoryLabel', 'formattedDate'],
}));

const newsListFiltersStub = vi.hoisted(() => ({
  template: `
    <div class="news-list-filters">
      <input
        class="filters-search"
        :value="search"
        placeholder="Поиск..."
        @input="$emit('update:search', $event.target.value)"
      />
      <button type="button" class="filters-search-btn" @click="$emit('search')">Search</button>
      <button v-if="hasActiveFilters" type="button" class="filters-reset" @click="$emit('reset')">Сбросить</button>
    </div>
  `,
  props: ['search', 'category', 'sortBy', 'aiFilter', 'fromDate', 'toDate', 'hasActiveFilters', 'categories'],
  emits: [
    'update:search',
    'update:category',
    'update:sortBy',
    'update:aiFilter',
    'update:fromDate',
    'update:toDate',
    'search',
    'reset',
  ],
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

vi.mock('@/components/news/NewsListFilters.vue', () => ({
  default: newsListFiltersStub,
}));

import NewsView from '@/pages/NewsView.vue';
import { useNewsStore } from '@/stores/news';
import { mockNewsItem, mockNewsResponse } from '../fixtures/mocks';
import { mountWithProviders } from '../utils/mountWithProviders';

const pageStubs = {
  VRow: { template: '<div class="v-row"><slot /></div>' },
  VCol: { template: '<div class="v-col"><slot /></div>', props: ['cols'] },
  VSkeletonLoader: { template: '<div class="v-skeleton-loader" />', props: ['type'] },
  VCard: { template: '<div class="v-card"><slot /></div>' },
  VCardText: { template: '<div class="v-card-text"><slot /></div>' },
  VDialog: {
    template: '<div v-if="modelValue" class="v-dialog"><slot /></div>',
    props: ['modelValue', 'maxWidth'],
  },
  VProgressCircular: {
    template: '<div class="v-progress-circular" />',
    props: ['indeterminate', 'color', 'size'],
  },
};

let intersectionCallback: IntersectionObserverCallback | null = null;

async function mountNewsView() {
  const wrapper = mountWithProviders(NewsView, {
    global: { stubs: pageStubs },
  });
  await flushPromises();
  return wrapper;
}

async function applySearch(wrapper: ReturnType<typeof mountWithProviders>, value: string) {
  await wrapper.find('.filters-search').setValue(value);
  await wrapper.find('.filters-search-btn').trigger('click');
  await flushPromises();
}

async function triggerIntersection(isIntersecting = true) {
  intersectionCallback?.(
    [{ isIntersecting } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
  await flushPromises();
}

describe('NewsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    getNewsMock.mockReset();
    getNewsMock.mockResolvedValue(mockNewsResponse);
    intersectionCallback = null;

    class IntersectionObserverTestMock {
      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: IntersectionObserverTestMock,
    });
  });

  it('renders title and loads news list on mount', async () => {
    const wrapper = await mountNewsView();

    expect(wrapper.text()).toContain('Лента новостей');
    expect(getNewsMock).toHaveBeenCalled();
    expect(wrapper.text()).toContain(mockNewsItem.title);
    expect(wrapper.text()).toContain('Все новости загружены');
  });

  it('shows empty state when filters match nothing', async () => {
    getNewsMock.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    });

    const wrapper = await mountNewsView();
    await applySearch(wrapper, 'missing');

    expect(getNewsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'missing', page: 1 }),
    );
    expect(wrapper.text()).toContain('Ничего не найдено');
  });

  it('shows default empty message without filters', async () => {
    getNewsMock.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    });

    const wrapper = await mountNewsView();

    expect(wrapper.text()).toContain('Новостей пока нет');
  });

  it('clears filters when reset button is clicked', async () => {
    getNewsMock
      .mockResolvedValueOnce(mockNewsResponse)
      .mockResolvedValueOnce({
        data: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      })
      .mockResolvedValueOnce(mockNewsResponse);

    const wrapper = await mountNewsView();
    await applySearch(wrapper, 'missing');

    expect(wrapper.find('.filters-reset').exists()).toBe(true);
    await wrapper.find('.filters-reset').trigger('click');
    await flushPromises();

    const store = useNewsStore();
    expect(store.filters.search).toBeUndefined();
    expect(getNewsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, sortBy: 'publishedAt' }),
    );
    expect(getNewsMock.mock.calls.at(-1)?.[0]).not.toHaveProperty('search');
  });

  it('loads more news when loader intersects', async () => {
    getNewsMock
      .mockResolvedValueOnce({ ...mockNewsResponse, total: 2, totalPages: 2 })
      .mockResolvedValueOnce({
        data: [{ ...mockNewsItem, id: 'news-2', title: 'Вторая новость' }],
        total: 2,
        page: 2,
        limit: 12,
        totalPages: 2,
      });

    const wrapper = await mountNewsView();
    expect(wrapper.text()).toContain(mockNewsItem.title);

    await triggerIntersection(true);

    expect(getNewsMock).toHaveBeenCalledTimes(2);
    expect(getNewsMock).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    expect(wrapper.text()).toContain('Вторая новость');
  });

  it('opens news modal when card is clicked', async () => {
    const wrapper = await mountNewsView();

    await wrapper.find('.news-card').trigger('click');
    await flushPromises();

    expect(wrapper.find('.v-dialog').exists()).toBe(true);
    expect(wrapper.find('.news-detail-modal').exists()).toBe(true);
  });
});
