import { describe, expect, it } from 'vitest';
import { mountWithProviders } from '../utils/mountWithProviders';
import NewsListFilters from '@/components/news/NewsListFilters.vue';

const categories = [
  { value: 'all', label: '📂 Все' },
  { value: 'technology', label: '💻 Технологии' },
];

describe('NewsListFilters', () => {
  const mountOptions = { stubVuetify: true as const };

  it('renders search and sort controls', () => {
    const wrapper = mountWithProviders(NewsListFilters, {
      ...mountOptions,
      props: {
        search: '',
        category: 'all',
        sortBy: 'publishedAt',
        aiFilter: 'all',
        fromDate: '',
        toDate: '',
        hasActiveFilters: false,
        categories,
      },
    });

    expect(wrapper.text()).toContain('Фильтры');
  });

  it('shows reset button when filters are active', () => {
    const wrapper = mountWithProviders(NewsListFilters, {
      ...mountOptions,
      props: {
        search: 'AI',
        category: 'all',
        sortBy: 'publishedAt',
        aiFilter: 'all',
        fromDate: '',
        toDate: '',
        hasActiveFilters: true,
        categories,
      },
    });

    expect(wrapper.text()).toContain('Сбросить');
  });

  it('emits search on enter', async () => {
    const wrapper = mountWithProviders(NewsListFilters, {
      ...mountOptions,
      props: {
        search: 'test',
        category: 'all',
        sortBy: 'publishedAt',
        aiFilter: 'all',
        fromDate: '',
        toDate: '',
        hasActiveFilters: false,
        categories,
      },
    });

    const input = wrapper.find('input');
    await input.trigger('keydown.enter');

    expect(wrapper.emitted('search')).toBeTruthy();
    expect(wrapper.emitted('search')!.length).toBeGreaterThanOrEqual(1);
  });

  it('emits reset when reset button clicked', async () => {
    const wrapper = mountWithProviders(NewsListFilters, {
      ...mountOptions,
      props: {
        search: 'AI',
        category: 'technology',
        sortBy: 'publishedAt',
        aiFilter: 'all',
        fromDate: '',
        toDate: '',
        hasActiveFilters: true,
        categories,
      },
    });

    const resetButton = wrapper.findAll('button').find((btn) => btn.text().includes('Сбросить'));
    expect(resetButton).toBeDefined();
    await resetButton!.trigger('click');

    expect(wrapper.emitted('reset')).toBeTruthy();
    expect(wrapper.emitted('reset')!.length).toBeGreaterThanOrEqual(1);
  });
});
