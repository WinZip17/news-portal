import { describe, expect, it } from 'vitest';
import { mountWithProviders } from '../utils/mountWithProviders';
import NewspaperMastheadStats from '@/components/newspaper/NewspaperMastheadStats.vue';
import { mockStats } from '../fixtures/mocks';

describe('NewspaperMastheadStats', () => {
  it('renders stat values from API', () => {
    const wrapper = mountWithProviders(NewspaperMastheadStats, {
      props: { stats: mockStats, loading: false },
    });

    expect(wrapper.text()).toContain('Сегодня');
    expect(wrapper.text()).toContain('5');
    expect(wrapper.text()).toContain('200');
    expect(wrapper.text()).toContain('1');
    expect(wrapper.text()).toContain('000');
  });

  it('shows loading placeholders', () => {
    const wrapper = mountWithProviders(NewspaperMastheadStats, {
      props: { stats: null, loading: true },
    });

    expect(wrapper.findAll('.newspaper-masthead-stat--loading')).toHaveLength(6);
  });
});
