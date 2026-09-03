import { describe, expect, it } from 'vitest';
import { mountWithProviders } from '../utils/mountWithProviders';
import NewsCard from '@/components/news/NewsCard.vue';
import { mockNewsItem } from '../fixtures/mocks';

describe('NewsCard', () => {
  const mountOptions = { stubVuetify: true as const };

  it('renders title, category and AI badge', () => {
    const wrapper = mountWithProviders(NewsCard, {
      ...mountOptions,
      props: {
        item: mockNewsItem,
        categoryColor: 'primary',
        categoryLabel: 'Технологии',
        formattedDate: '20 авг. 2026',
      },
    });

    expect(wrapper.text()).toContain(mockNewsItem.title);
    expect(wrapper.text()).toContain('Технологии');
    expect(wrapper.text()).toContain('AI');
    expect(wrapper.text()).toContain('20 авг. 2026');
  });

  it('shows original badge for non-AI news', () => {
    const wrapper = mountWithProviders(NewsCard, {
      ...mountOptions,
      props: {
        item: { ...mockNewsItem, isAiGenerated: false },
        categoryColor: 'success',
        categoryLabel: 'Спорт',
        formattedDate: '20 авг. 2026',
      },
    });

    expect(wrapper.text()).toContain('Оригинал');
    expect(wrapper.text()).not.toContain('AI');
  });

  it('emits click when card is clicked', async () => {
    const wrapper = mountWithProviders(NewsCard, {
      ...mountOptions,
      props: {
        item: mockNewsItem,
        categoryColor: 'primary',
        categoryLabel: 'Технологии',
        formattedDate: '20 авг. 2026',
      },
    });

    await wrapper.find('.v-card').trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
    expect(wrapper.emitted('click')!.length).toBeGreaterThanOrEqual(1);
  });
});
