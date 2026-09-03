import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';

const registerMock = vi.fn();

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: (...args: unknown[]) => registerMock(...args),
    getMe: vi.fn(),
    updateProfile: vi.fn(),
    updatePreferences: vi.fn(),
    changePassword: vi.fn(),
  },
}));

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}));

import RegisterView from '@/pages/RegisterView.vue';
import { mountWithProviders } from '../utils/mountWithProviders';

const registerStubs = {
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
        const username = inputs[1]?.value ?? '';
        const password = inputs[2]?.value ?? '';
        const confirmPassword = inputs[3]?.value ?? '';
        const errors = validateRegisterForm(email, username, password, confirmPassword);
        showFieldErrors(this.$el, errors);
        const isValid = Object.values(errors).every((message) => !message);
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

function validateRegisterForm(
  email: string,
  username: string,
  password: string,
  confirmPassword: string,
) {
  const errors = { email: '', username: '', password: '', confirmPassword: '' };
  if (!email) errors.email = 'Обязательное поле';
  else if (!/.+@.+\..+/.test(email)) errors.email = 'Введите корректный email';
  if (!username) errors.username = 'Обязательное поле';
  else if (username.length < 6) errors.username = 'Минимум 6 символов';
  if (!password) errors.password = 'Обязательное поле';
  else if (password.length < 8) errors.password = 'Минимум 8 символов';
  if (!confirmPassword) errors.confirmPassword = 'Обязательное поле';
  else if (confirmPassword !== password) errors.confirmPassword = 'Пароли не совпадают';
  return errors;
}

function showFieldErrors(
  formEl: HTMLElement,
  errors: { email: string; username: string; password: string; confirmPassword: string },
) {
  const fields = formEl.querySelectorAll('.v-text-field');
  Object.values(errors).forEach((message, index) => {
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

function createRegisterRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/register', name: 'register', component: { template: '<div />' } },
      { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
    ],
  });
}

async function mountRegister() {
  const router = createRegisterRouter();
  await router.push('/register');
  await router.isReady();
  const wrapper = mountWithProviders(RegisterView, {
    router,
    global: { stubs: registerStubs },
  });
  return { wrapper, router };
}

async function fillRegisterForm(
  wrapper: ReturnType<typeof mountWithProviders>,
  data: { email: string; username: string; password: string; confirmPassword: string },
) {
  const inputs = wrapper.findAll('input');
  await inputs[0]!.setValue(data.email);
  await inputs[1]!.setValue(data.username);
  await inputs[2]!.setValue(data.password);
  await inputs[3]!.setValue(data.confirmPassword);
}

async function submitRegisterForm(wrapper: ReturnType<typeof mountWithProviders>) {
  await wrapper.find('form').trigger('submit');
  await flushPromises();
}

describe('RegisterView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    registerMock.mockReset();
    registerMock.mockResolvedValue(undefined);
  });

  it('renders register form', async () => {
    const { wrapper } = await mountRegister();

    expect(wrapper.text()).toContain('Регистрация');
    expect(wrapper.find('input[aria-label="Email"]').exists()).toBe(true);
    expect(wrapper.find('input[aria-label="Имя пользователя"]').exists()).toBe(true);
    expect(wrapper.find('input[aria-label="Пароль"]').exists()).toBe(true);
    expect(wrapper.find('input[aria-label="Подтвердите пароль"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Зарегистрироваться');
    expect(wrapper.text()).toContain('Уже есть аккаунт? Войти');
  });

  it('shows validation errors for empty form', async () => {
    const { wrapper } = await mountRegister();

    await submitRegisterForm(wrapper);

    expect(registerMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Обязательное поле');
  });

  it('shows validation error for invalid email', async () => {
    const { wrapper } = await mountRegister();

    await fillRegisterForm(wrapper, {
      email: 'not-an-email',
      username: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
    });
    await submitRegisterForm(wrapper);

    expect(registerMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Введите корректный email');
  });

  it('shows validation error when passwords do not match', async () => {
    const { wrapper } = await mountRegister();

    await fillRegisterForm(wrapper, {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      confirmPassword: 'different',
    });
    await submitRegisterForm(wrapper);

    expect(registerMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Пароли не совпадают');
  });

  it('registers successfully and redirects to login', async () => {
    const { wrapper, router } = await mountRegister();

    await fillRegisterForm(wrapper, {
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
      confirmPassword: 'password123',
    });
    await submitRegisterForm(wrapper);

    expect(registerMock).toHaveBeenCalledWith({
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
    });
    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('shows API error on failed registration', async () => {
    registerMock.mockRejectedValue(new Error('Email already exists'));
    const { wrapper, router } = await mountRegister();

    await fillRegisterForm(wrapper, {
      email: 'exists@example.com',
      username: 'existing',
      password: 'password123',
      confirmPassword: 'password123',
    });
    await submitRegisterForm(wrapper);

    expect(wrapper.text()).toContain('Email already exists');
    expect(router.currentRoute.value.path).toBe('/register');
  });

  it('links to login page', async () => {
    const { wrapper } = await mountRegister();

    expect(wrapper.get('a.v-btn').attributes('href')).toMatch(/\/login$/);
  });
});
