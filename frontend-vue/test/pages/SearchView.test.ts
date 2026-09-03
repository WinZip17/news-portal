import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';

const smartSearchMock = vi.fn();

vi.mock('@/services/news.service', () => ({
  newsService: {
    smartSearch: (...args: unknown[]) => smartSearchMock(...args),
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

import SearchView from '@/pages/SearchView.vue';
import { mockNewsItem } from '../fixtures/mocks';
import { mountWithProviders } from '../utils/mountWithProviders';

const searchStubs = {
  VTextarea: {
    template: `
      <textarea
        class="v-textarea"
        :value="modelValue"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
        @keydown="$emit('keydown', $event)"
      />
    `,
    props: ['modelValue', 'label', 'placeholder', 'rows', 'density', 'autoGrow', 'hideDetails'],
  },
  VBtn: {
    template:
      '<button type="button" class="v-btn" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['color', 'prependIcon', 'loading', 'disabled'],
  },
  VChip: {
    template: '<button type="button" class="v-chip" @click="$emit(\'click\')"><slot /></button>',
    props: ['variant'],
  },
  VRow: { template: '<div class="v-row"><slot /></div>' },
  VCol: { template: '<div class="v-col"><slot /></div>', props: ['cols'] },
  VSkeletonLoader: { template: '<div class="v-skeleton-loader" />', props: ['type'] },
  VDialog: {
    template: '<div v-if="modelValue" class="v-dialog"><slot /></div>',
    props: ['modelValue', 'maxWidth'],
  },
};

const smartSearchResponse = {
  data: [mockNewsItem],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
  source: 'ai' as const,
  appliedFilters: { search: 'AI новости' },
};

async function mountSearch() {
  const wrapper = mountWithProviders(SearchView, {
    global: { stubs: searchStubs },
  });
  await flushPromises();
  return wrapper;
}

function findButton(wrapper: ReturnType<typeof mountWithProviders>, label: string) {
  return wrapper.findAll('.v-btn').find((btn) => btn.text().includes(label));
}

async function runSearch(wrapper: ReturnType<typeof mountWithProviders>, value: string) {
  await wrapper.find('textarea').setValue(value);
  await findButton(wrapper, 'Найти')!.trigger('click');
  await flushPromises();
}

describe('SearchView', () => {
  beforeEach(() => {
    smartSearchMock.mockReset();
    smartSearchMock.mockResolvedValue(smartSearchResponse);
  });

  it('renders search form and hint before search', async () => {
    const wrapper = await mountSearch();

    expect(wrapper.text()).toContain('Умный поиск');
    expect(wrapper.text()).toContain('Введите запрос и нажмите «Найти».');
    expect(findButton(wrapper, 'Найти')!.attributes('disabled')).toBeDefined();
    expect(smartSearchMock).not.toHaveBeenCalled();
  });

  it('fills query from example chip click', async () => {
    const wrapper = await mountSearch();

    const exampleChip = wrapper.findAll('.v-chip').find((chip) => chip.text().includes('экономика и инфляция'));
    await exampleChip!.trigger('click');

    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('экономика и инфляция');
    expect(findButton(wrapper, 'Найти')!.attributes('disabled')).toBeUndefined();
  });

  it('performs search and shows results with applied filters hint', async () => {
    const wrapper = await mountSearch();

    await runSearch(wrapper, 'AI новости');

    expect(smartSearchMock).toHaveBeenCalledWith('AI новости', 1, 20);
    expect(wrapper.text()).toContain(mockNewsItem.title);
    expect(wrapper.text()).toContain('Распознано');
    expect(wrapper.text()).toContain('поиск: «AI новости»');
  });

  it('shows empty state when search returns no results', async () => {
    smartSearchMock.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      source: 'fallback' as const,
      appliedFilters: { search: 'пусто' },
    });

    const wrapper = await mountSearch();
    await runSearch(wrapper, 'пусто');

    expect(wrapper.text()).toContain('По запросу «пусто» ничего не найдено.');
    expect(wrapper.text()).toContain('Распознано (без AI)');
  });

  it('does not search for blank query', async () => {
    const wrapper = await mountSearch();

    await wrapper.find('textarea').setValue('   ');
    await findButton(wrapper, 'Найти')!.trigger('click');
    await flushPromises();

    expect(smartSearchMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Введите запрос и нажмите «Найти».');
  });

  it('opens news modal when result card is clicked', async () => {
    const wrapper = await mountSearch();
    await runSearch(wrapper, 'AI новости');

    await wrapper.find('.news-card').trigger('click');
    await flushPromises();

    expect(wrapper.find('.v-dialog').exists()).toBe(true);
    expect(wrapper.find('.news-detail-modal').exists()).toBe(true);
  });
});
