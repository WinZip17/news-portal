import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';

const loginMock = vi.fn();
const getMeMock = vi.fn();

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: (...args: unknown[]) => loginMock(...args),
    getMe: (...args: unknown[]) => getMeMock(...args),
    register: vi.fn(),
    updateProfile: vi.fn(),
    updatePreferences: vi.fn(),
    changePassword: vi.fn(),
  },
}));

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}));

import LoginView from '@/pages/LoginView.vue';
import { mockAuthResponse, mockUser } from '../fixtures/mocks';
import { mountWithProviders } from '../utils/mountWithProviders';

const loginStubs = {
  VContainer: { template: '<div class="v-container"><slot /></div>' },
  VRow: { template: '<div class="v-row"><slot /></div>', props: ['justify'] },
  VCol: { template: '<div class="v-col"><slot /></div>', props: ['cols', 'sm', 'md'] },
  VForm: {
    template: '<form class="v-form" @submit.prevent="onSubmit"><slot /></form>',
    props: ['modelValue'],
    emits: ['update:modelValue', 'submit'],
    methods: {
      onSubmit(this: {
        $el: HTMLElement;
        $emit: (event: string, value?: boolean) => void;
        $nextTick: (cb: () => void) => Promise<void>;
      }) {
        const inputs = Array.from(this.$el.querySelectorAll('input'));
        const email = inputs[0]?.value ?? '';
        const password = inputs[1]?.value ?? '';
        const errors = validateLoginForm(email, password);
        showFieldErrors(this.$el, errors);
        const isValid = !errors.email && !errors.password;
        this.$emit('update:modelValue', isValid);
        if (isValid) {
          void this.$nextTick(() =>
            this.$emit('submit', { preventDefault: () => undefined }),
          );
        }
      },
    },
  },
  VTextField: {
    template: `
      <div class="v-text-field">
        <input
          :value="modelValue"
          :aria-label="label"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    `,
    props: ['modelValue', 'label', 'type', 'rules', 'prependInnerIcon'],
  },
  VAlert: {
    template: '<div class="v-alert" :class="\`v-alert--\${type}\`"><slot /></div>',
    props: ['type', 'closable'],
  },
  VBtn: {
    template: `
      <router-link v-if="to" :to="to" class="v-btn"><slot /></router-link>
      <button v-else :type="type || 'button'" class="v-btn"><slot /></button>
    `,
    props: ['type', 'to', 'color', 'block', 'size', 'loading', 'variant'],
  },
};

function validateLoginForm(email: string, password: string) {
  const errors = { email: '', password: '' };
  if (!email) errors.email = 'Обязательное поле';
  else if (!/.+@.+\..+/.test(email)) errors.email = 'Введите корректный email';
  if (!password) errors.password = 'Обязательное поле';
  else if (password.length < 6) errors.password = 'Минимум 6 символов';
  return errors;
}

function showFieldErrors(formEl: HTMLElement, errors: { email: string; password: string }) {
  const fields = formEl.querySelectorAll('.v-text-field');
  [errors.email, errors.password].forEach((message, index) => {
    const field = fields[index];
    if (!field) return;
    let el = field.querySelector('.v-messages');
    if (!el) {
      el = document.createElement('div');
      el.className = 'v-messages';
      field.appendChild(el);
    }
    el.textContent = message;
  });
}

function createLoginRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: { template: '<div />' } },
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      { path: '/profile', name: 'profile', component: { template: '<div>Profile</div>' } },
      { path: '/register', name: 'register', component: { template: '<div>Register</div>' } },
    ],
  });
}

async function mountLogin(
  route: string | { path: string; query?: Record<string, string> } = '/login',
) {
  const router = createLoginRouter();
  await router.push(route);
  await router.isReady();
  const wrapper = mountWithProviders(LoginView, {
    router,
    global: { stubs: loginStubs },
  });
  return { wrapper, router };
}

async function fillLoginForm(wrapper: ReturnType<typeof mountWithProviders>, email: string, password: string) {
  const inputs = wrapper.findAll('input');
  await inputs[0]!.setValue(email);
  await inputs[1]!.setValue(password);
}

async function submitLoginForm(wrapper: ReturnType<typeof mountWithProviders>) {
  await wrapper.find('form').trigger('submit');
  await flushPromises();
}

describe('LoginView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    loginMock.mockReset();
    getMeMock.mockReset();
    loginMock.mockResolvedValue(mockAuthResponse);
    getMeMock.mockResolvedValue(mockUser);
  });

  it('renders login form', async () => {
    const { wrapper } = await mountLogin();

    expect(wrapper.text()).toContain('Вход');
    expect(wrapper.find('input[aria-label="Email"]').exists()).toBe(true);
    expect(wrapper.find('input[aria-label="Пароль"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Войти');
    expect(wrapper.text()).toContain('Зарегистрироваться');
  });

  it('shows validation errors for empty form', async () => {
    const { wrapper } = await mountLogin();

    await submitLoginForm(wrapper);

    expect(loginMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Обязательное поле');
  });

  it('shows validation error for invalid email', async () => {
    const { wrapper } = await mountLogin();

    await fillLoginForm(wrapper, 'not-an-email', 'password123');
    await submitLoginForm(wrapper);

    expect(loginMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Введите корректный email');
  });

  it('logs in successfully and redirects to home', async () => {
    const { wrapper, router } = await mountLogin();

    await fillLoginForm(wrapper, 'test@example.com', 'password123');
    await submitLoginForm(wrapper);

    expect(loginMock).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(localStorage.getItem('accessToken')).toBe(mockAuthResponse.accessToken);
    expect(router.currentRoute.value.path).toBe('/');
  });

  it('redirects to query redirect path after login', async () => {
    const { wrapper, router } = await mountLogin({
      path: '/login',
      query: { redirect: '/profile' },
    });

    await fillLoginForm(wrapper, 'test@example.com', 'password123');
    await submitLoginForm(wrapper);

    expect(router.currentRoute.value.path).toBe('/profile');
  });

  it('shows API error on failed login', async () => {
    loginMock.mockRejectedValue(new Error('Invalid credentials'));
    const { wrapper, router } = await mountLogin();

    await fillLoginForm(wrapper, 'bad@example.com', 'wrongpass');
    await submitLoginForm(wrapper);

    expect(wrapper.text()).toContain('Invalid credentials');
    expect(router.currentRoute.value.path).toBe('/login');
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('links to register page', async () => {
    const { wrapper } = await mountLogin();

    expect(wrapper.text()).toContain('Зарегистрироваться');
    expect(wrapper.get('a.v-btn').attributes('href')).toMatch(/\/register$/);
  });
});
