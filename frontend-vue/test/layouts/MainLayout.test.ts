import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import { createPinia, getActivePinia, setActivePinia } from 'pinia';

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}));

vi.mock('vuetify', () => ({
  useDisplay: () => ({ smAndDown: false }),
}));

import MainLayout from '@/layouts/MainLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { UserRole } from '@/types';
import { mockUser } from '../fixtures/mocks';
import { mountWithProviders } from '../utils/mountWithProviders';

const layoutStubs = {
  FrameworkSwitcher: {
    template: '<div class="framework-switcher" />',
    props: ['current'],
  },
  VLayout: { template: '<div class="v-layout"><slot /></div>' },
  VNavigationDrawer: {
    template: '<nav class="v-navigation-drawer"><slot /></nav>',
    props: ['permanent', 'rail', 'modelValue', 'temporary'],
  },
  VList: {
    template: '<div class="v-list"><slot /></div>',
    props: ['nav', 'density'],
  },
  VListItem: {
    template: '<button type="button" class="v-list-item" @click="$emit(\'click\')">{{ title }}</button>',
    props: ['title', 'prependIcon', 'active'],
  },
  VAppBar: { template: '<header class="v-app-bar"><slot /></header>', props: ['elevation'] },
  VAppBarNavIcon: {
    template: '<button type="button" class="v-app-bar-nav-icon" @click="$emit(\'click\')" />',
  },
  VAppBarTitle: {
    template: '<div class="v-app-bar-title"><slot /></div>',
  },
  VSpacer: { template: '<span class="v-spacer" />' },
  VBtn: {
    props: ['icon', 'color', 'size', 'variant'],
    template: '<button type="button" class="v-btn" :data-icon="icon"><slot /></button>',
  },
  VMenu: {
    template: `
      <div class="v-menu">
        <slot name="activator" :props="{}" />
        <div class="v-menu-content"><slot /></div>
      </div>
    `,
  },
  VMain: { template: '<main class="v-main"><slot /></main>' },
  VContainer: {
    template: '<div class="v-container"><slot /></div>',
    props: ['fluid'],
  },
  VFooter: {
    template: '<footer class="v-footer"><slot /></footer>',
    props: ['app', 'class'],
  },
};

function createLayoutRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/news', name: 'news', component: { template: '<div />' } },
      { path: '/search', name: 'search', component: { template: '<div />' } },
      { path: '/profile', name: 'profile', component: { template: '<div />' } },
      { path: '/admin', name: 'admin', component: { template: '<div />' } },
      { path: '/login', name: 'login', component: { template: '<div />' } },
    ],
  });
}

function setGuest() {
  const store = useAuthStore();
  store.logout();
}

function setAuthenticated(role: UserRole = UserRole.USER) {
  const store = useAuthStore();
  store.accessToken = 'test-token';
  store.user = { ...mockUser, role };
  localStorage.setItem('accessToken', 'test-token');
}

function findNavItem(wrapper: ReturnType<typeof mountWithProviders>, title: string) {
  const drawer = wrapper.find('.v-navigation-drawer');
  return drawer
    .findAll('.v-list-item')
    .find((item) => item.text().includes(title));
}

async function mountLayout(path = '/') {
  const router = createLayoutRouter();
  await router.push(path);
  await router.isReady();
  const wrapper = mountWithProviders(MainLayout, {
    pinia: getActivePinia()!,
    router,
    slots: { default: '<div class="page-content">Page</div>' },
    global: { stubs: layoutStubs },
  });
  await flushPromises();
  return { wrapper, router };
}

describe('MainLayout', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    setGuest();
  });

  it('renders guest navigation without profile and admin links', async () => {
    const { wrapper } = await mountLayout();

    expect(findNavItem(wrapper, 'Главная')).toBeDefined();
    expect(findNavItem(wrapper, 'Новости')).toBeDefined();
    expect(findNavItem(wrapper, 'Умный поиск')).toBeDefined();
    expect(findNavItem(wrapper, 'Профиль')).toBeUndefined();
    expect(findNavItem(wrapper, 'Админ-панель')).toBeUndefined();
    expect(wrapper.find('.framework-switcher').exists()).toBe(true);
    expect(wrapper.find('.page-content').exists()).toBe(true);
  });

  it('shows profile link for authenticated user', async () => {
    setAuthenticated();
    const { wrapper } = await mountLayout();

    expect(findNavItem(wrapper, 'Профиль')).toBeDefined();
    expect(findNavItem(wrapper, 'Админ-панель')).toBeUndefined();
  });

  it('shows admin link for moderator', async () => {
    setAuthenticated(UserRole.MODERATOR);
    const { wrapper } = await mountLayout();

    expect(findNavItem(wrapper, 'Профиль')).toBeDefined();
    expect(findNavItem(wrapper, 'Админ-панель')).toBeDefined();
  });

  it('navigates when sidebar item is clicked', async () => {
    const { wrapper, router } = await mountLayout('/');

    await findNavItem(wrapper, 'Новости')!.trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/news');
  });

  it('shows page title for current route', async () => {
    const { wrapper } = await mountLayout('/news');

    expect(wrapper.find('.v-app-bar-title').text()).toBe('Новости');
  });

  it('toggles theme from app bar button', async () => {
    const { wrapper } = await mountLayout();
    const uiStore = useUIStore();

    expect(uiStore.theme).toBe('light');

    const themeButton = wrapper.find('[data-icon="mdi-weather-night"]');
    expect(themeButton.exists()).toBe(true);
    await themeButton.trigger('click');
    await flushPromises();

    expect(uiStore.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('logs out and redirects to login', async () => {
    setAuthenticated();
    const { wrapper, router } = await mountLayout('/profile');

    const logoutItem = wrapper.findAll('.v-list-item').find((item) => item.text().includes('Выйти'));
    await logoutItem!.trigger('click');
    await flushPromises();

    const authStore = useAuthStore();
    expect(authStore.isAuthenticated).toBe(false);
    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('shows login action for guest in account menu', async () => {
    const { wrapper, router } = await mountLayout();

    const loginItem = wrapper.findAll('.v-list-item').find((item) => item.text().includes('Войти'));
    expect(loginItem).toBeDefined();
    await loginItem!.trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/login');
  });
});
