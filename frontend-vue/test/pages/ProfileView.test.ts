import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';

const getMeMock = vi.fn();
const updateProfileMock = vi.fn();
const updatePreferencesMock = vi.fn();
const changePasswordMock = vi.fn();
const getFavoritesMock = vi.fn();
const toggleFavoriteMock = vi.fn();

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: (...args: unknown[]) => getMeMock(...args),
    updateProfile: (...args: unknown[]) => updateProfileMock(...args),
    updatePreferences: (...args: unknown[]) => updatePreferencesMock(...args),
    changePassword: (...args: unknown[]) => changePasswordMock(...args),
  },
}));

vi.mock('@/services/news.service', () => ({
  newsService: {
    getFavorites: (...args: unknown[]) => getFavoritesMock(...args),
    toggleFavorite: (...args: unknown[]) => toggleFavoriteMock(...args),
  },
}));

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}));

import ProfileView from '@/pages/ProfileView.vue';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { mockNewsItem, mockUser } from '../fixtures/mocks';
import { mountWithProviders } from '../utils/mountWithProviders';

const profileStubs = {
  VContainer: { template: '<div class="v-container"><slot /></div>' },
  VTabs: {
    template: '<div class="v-tabs"><slot /></div>',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
  VTab: {
    template: '<button type="button" class="v-tab" @click="$emit(\'click\')"><slot /></button>',
    props: ['value'],
  },
  VWindow: {
    template: '<div class="v-window"><slot /></div>',
    props: ['modelValue'],
  },
  VWindowItem: {
    template: '<div class="v-window-item"><slot /></div>',
    props: ['value'],
  },
  VCard: {
    template: '<div class="v-card"><slot /></div>',
    props: ['maxWidth'],
  },
  VCardText: { template: '<div class="v-card-text"><slot /></div>' },
  VTextField: {
    template: `
      <div class="v-text-field">
        <input
          :value="modelValue"
          :aria-label="label"
          :disabled="disabled"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    `,
    props: ['modelValue', 'label', 'type', 'disabled'],
  },
  VSelect: {
    template: `
      <select class="v-select" :aria-label="label" :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
        <option v-for="item in items" :key="item.value" :value="item.value">{{ item.title }}</option>
      </select>
    `,
    props: ['modelValue', 'items', 'label'],
  },
  VSwitch: {
    template: `
      <input
        type="checkbox"
        class="v-switch"
        :checked="modelValue"
        :aria-label="label"
        @change="onChange"
      />
    `,
    props: ['modelValue', 'label', 'color'],
    methods: {
      onChange(event: Event) {
        const target = event.target as HTMLInputElement;
        this.$emit('update:modelValue', target.checked);
      },
    },
  },
  VAlert: {
    template: '<div class="v-alert" :class="\`v-alert--\${type}\`"><slot /></div>',
    props: ['type', 'closable'],
  },
  VBtn: {
    template: '<button type="button" class="v-btn" @click="$emit(\'click\')"><slot /></button>',
    props: ['color', 'icon', 'variant'],
  },
  VList: { template: '<div class="v-list"><slot /></div>' },
  VListItem: {
    template: `
      <div class="v-list-item">
        <span class="v-list-item-title">{{ title }}</span>
        <span class="v-list-item-subtitle">{{ subtitle }}</span>
        <slot name="append" />
      </div>
    `,
    props: ['title', 'subtitle'],
  },
};

function createProfileRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/profile', name: 'profile', component: { template: '<div />' } },
      { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
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

async function mountProfile() {
  const router = createProfileRouter();
  await router.push('/profile');
  await router.isReady();
  const wrapper = mountWithProviders(ProfileView, {
    router,
    global: { stubs: profileStubs },
  });
  await flushPromises();
  return { wrapper, router };
}

describe('ProfileView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    getMeMock.mockReset();
    updateProfileMock.mockReset();
    updatePreferencesMock.mockReset();
    changePasswordMock.mockReset();
    getFavoritesMock.mockReset();
    toggleFavoriteMock.mockReset();
    getMeMock.mockResolvedValue(mockUser);
    updateProfileMock.mockResolvedValue({ ...mockUser, firstName: 'UpdatedName' });
    updatePreferencesMock.mockResolvedValue({
      ...mockUser,
      preferences: { ...mockUser.preferences, theme: 'light' as const },
    });
    changePasswordMock.mockResolvedValue(undefined);
    getFavoritesMock.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    toggleFavoriteMock.mockResolvedValue({ favorited: false });
  });

  it('redirects guest to login', async () => {
    const { router } = await mountProfile();

    expect(router.currentRoute.value.path).toBe('/login');
    expect(getMeMock).not.toHaveBeenCalled();
  });

  it('renders profile heading and tabs for authenticated user', async () => {
    setAuthenticated();
    const { wrapper } = await mountProfile();

    expect(wrapper.text()).toContain('Личный кабинет');
    expect(wrapper.text()).toContain('Профиль');
    expect(wrapper.text()).toContain('Пароль');
    expect(wrapper.text()).toContain('Настройки');
    expect(wrapper.text()).toContain('Избранное');
  });

  it('shows user data and updates profile', async () => {
    setAuthenticated();
    const { wrapper } = await mountProfile();

    expect(getMeMock).toHaveBeenCalled();
    expect((wrapper.find('input[aria-label="Email"]').element as HTMLInputElement).value).toBe(
      mockUser.email,
    );
    expect((wrapper.find('input[aria-label="Username"]').element as HTMLInputElement).value).toBe(
      mockUser.username,
    );
    expect((wrapper.find('input[aria-label="Имя"]').element as HTMLInputElement).value).toBe(
      mockUser.firstName,
    );

    await wrapper.find('input[aria-label="Имя"]').setValue('UpdatedName');
    await findButton(wrapper, 'Сохранить')!.trigger('click');
    await flushPromises();

    expect(updateProfileMock).toHaveBeenCalledWith({
      firstName: 'UpdatedName',
      lastName: mockUser.lastName,
    });
    expect(wrapper.text()).toContain('Профиль обновлен');
  });

  it('shows password mismatch error', async () => {
    setAuthenticated();
    const { wrapper } = await mountProfile();

    await wrapper.find('input[aria-label="Текущий пароль"]').setValue('OldPass1');
    await wrapper.find('input[aria-label="Новый пароль"]').setValue('NewPass1');
    await wrapper.find('input[aria-label="Подтвердите пароль"]').setValue('Different');
    await findButton(wrapper, 'Сменить пароль')!.trigger('click');
    await flushPromises();

    expect(changePasswordMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Пароли не совпадают');
  });

  it('changes password successfully', async () => {
    setAuthenticated();
    const { wrapper } = await mountProfile();

    await wrapper.find('input[aria-label="Текущий пароль"]').setValue('OldPass1');
    await wrapper.find('input[aria-label="Новый пароль"]').setValue('NewPass1');
    await wrapper.find('input[aria-label="Подтвердите пароль"]').setValue('NewPass1');
    await findButton(wrapper, 'Сменить пароль')!.trigger('click');
    await flushPromises();

    expect(changePasswordMock).toHaveBeenCalledWith({
      currentPassword: 'OldPass1',
      newPassword: 'NewPass1',
    });
    expect(wrapper.text()).toContain('Пароль изменен');
  });

  it('saves preferences and updates ui theme', async () => {
    setAuthenticated();
    const { wrapper } = await mountProfile();
    const uiStore = useUIStore();

    await wrapper.find('select[aria-label="Тема"]').setValue('light');
    await wrapper.findAll('.v-btn').filter((btn) => btn.text() === 'Сохранить')[1]!.trigger('click');
    await flushPromises();

    expect(updatePreferencesMock).toHaveBeenCalledWith({
      theme: 'light',
      notificationsEnabled: true,
    });
    expect(uiStore.theme).toBe('light');
    expect(wrapper.text()).toContain('Настройки сохранены');
  });

  it('shows empty favorites state', async () => {
    setAuthenticated();
    const { wrapper } = await mountProfile();

    expect(getFavoritesMock).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Нет избранных новостей');
  });

  it('loads favorites and removes item', async () => {
    getFavoritesMock.mockResolvedValue({
      data: [mockNewsItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    setAuthenticated();
    const { wrapper } = await mountProfile();

    expect(wrapper.text()).toContain(mockNewsItem.title);

    await wrapper.find('.v-list-item .v-btn').trigger('click');
    await flushPromises();

    expect(toggleFavoriteMock).toHaveBeenCalledWith(mockNewsItem.id);
    expect(wrapper.text()).not.toContain(mockNewsItem.title);
    expect(wrapper.text()).toContain('Нет избранных новостей');
  });
});
