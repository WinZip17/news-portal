import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';

import NotFoundView from '@/pages/NotFoundView.vue';
import { mountWithProviders } from '../utils/mountWithProviders';

const notFoundStubs = {
  VContainer: { template: '<div class="v-container"><slot /></div>', props: ['class'] },
  VRow: {
    template: '<div class="v-row"><slot /></div>',
    props: ['justify', 'align'],
  },
  VCol: {
    template: '<div class="v-col"><slot /></div>',
    props: ['cols', 'md', 'class'],
  },
  VIcon: {
    template: '<span class="v-icon" />',
    props: ['icon', 'size', 'color', 'class'],
  },
  VBtn: {
    template: '<button type="button" class="v-btn" @click="$emit(\'click\')"><slot /></button>',
    props: ['color', 'size', 'variant'],
  },
};

function createNotFoundRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/404', name: 'not-found', component: { template: '<div />' } },
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      { path: '/news', name: 'news', component: { template: '<div>News</div>' } },
    ],
  });
}

function findButton(wrapper: ReturnType<typeof mountWithProviders>, label: string) {
  return wrapper.findAll('.v-btn').find((btn) => btn.text().includes(label));
}

async function mountNotFound() {
  const router = createNotFoundRouter();
  await router.push('/404');
  await router.isReady();
  const wrapper = mountWithProviders(NotFoundView, {
    router,
    global: { stubs: notFoundStubs },
  });
  return { wrapper, router };
}

describe('NotFoundView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders 404 page content', async () => {
    const { wrapper } = await mountNotFound();

    expect(wrapper.text()).toContain('404');
    expect(wrapper.text()).toContain('Страница не найдена');
    expect(findButton(wrapper, 'На главную')).toBeDefined();
    expect(findButton(wrapper, 'Назад')).toBeDefined();
    expect(findButton(wrapper, 'К новостям')).toBeDefined();
  });

  it('navigates to home', async () => {
    const { wrapper, router } = await mountNotFound();

    await findButton(wrapper, 'На главную')!.trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/');
  });

  it('navigates to news feed', async () => {
    const { wrapper, router } = await mountNotFound();

    await findButton(wrapper, 'К новостям')!.trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/news');
  });

  it('calls router.back on back button click', async () => {
    const { wrapper, router } = await mountNotFound();
    const backSpy = vi.spyOn(router, 'back');

    await findButton(wrapper, 'Назад')!.trigger('click');

    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });
});
