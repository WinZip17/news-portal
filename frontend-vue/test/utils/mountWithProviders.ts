import { mount, type MountingOptions, type VueWrapper } from '@vue/test-utils';
import { createPinia, type Pinia } from 'pinia';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import type { Component } from 'vue';

const vuetifyStubs = {
  VTextField: {
    template:
      '<div class="v-text-field"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keydown="$emit(\'keydown\', $event)" /></div>',
    props: ['modelValue', 'label'],
  },
  VSelect: {
    template:
      '<select class="v-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
    props: ['modelValue'],
  },
  VBtn: {
    template: '<button type="button" class="v-btn" @click="$emit(\'click\')"><slot /></button>',
  },
  VMenu: {
    template: '<div class="v-menu"><slot name="activator" :props="{}" /><slot /></div>',
  },
  VBadge: {
    template: '<div class="v-badge"><slot /></div>',
  },
  VCard: {
    template: '<div class="v-card" @click="$emit(\'click\')"><slot /></div>',
  },
  VCardItem: {
    template: '<div class="v-card-item"><slot /></div>',
  },
  VCardTitle: {
    template: '<div class="v-card-title"><slot /></div>',
  },
  VCardSubtitle: {
    template: '<div class="v-card-subtitle"><slot /></div>',
  },
  VCardActions: {
    template: '<div class="v-card-actions"><slot /></div>',
  },
  VCardText: {
    template: '<div class="v-card-text"><slot /></div>',
  },
  VAlert: {
    template: '<div class="v-alert">{{ text }}</div>',
    props: ['type', 'text', 'variant'],
  },
  VChip: {
    template: '<span class="v-chip"><slot /></span>',
    props: ['color', 'size', 'label', 'variant'],
  },
  VImg: {
    template: '<img class="v-img" :src="src" />',
    props: ['src', 'height', 'cover'],
  },
  VProgressCircular: {
    template: '<div class="v-progress-circular" />',
  },
  VSnackbar: {
    template: '<div v-if="modelValue" class="v-snackbar"><slot /></div>',
    props: ['modelValue', 'timeout'],
  },
  VSpacer: {
    template: '<span class="v-spacer" />',
  },
};

type MountOptions<T> = MountingOptions<T> & {
  pinia?: Pinia;
  router?: Router;
  stubVuetify?: boolean;
};

function lazyVuetify() {
  const { createAppVuetify } = require('@/plugins/vuetify') as typeof import('@/plugins/vuetify');
  return createAppVuetify();
}

export function mountWithProviders<T extends Component>(
  component: T,
  options: MountOptions<T> = {},
): VueWrapper {
  const pinia = options.pinia ?? createPinia();
  const router =
    options.router ??
    createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
    });

  const { pinia: _pinia, router: _router, stubVuetify = true, ...rest } = options;
  const plugins = stubVuetify ? [pinia, router] : [pinia, lazyVuetify(), router];

  return mount(component, {
    ...rest,
    global: {
      plugins,
      ...rest.global,
      stubs: {
        ...(stubVuetify ? vuetifyStubs : {}),
        ...rest.global?.stubs,
      },
    },
  });
}
