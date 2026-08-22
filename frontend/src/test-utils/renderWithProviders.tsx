import { render, renderHook, type RenderHookOptions, type RenderOptions } from '@testing-library/react';
import { configureStore, type PreloadedState } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import type { ReactElement, ReactNode } from 'react';
import authReducer from '@/store/auth/authSlice';
import newsReducer from '@/store/news/newsSlice';
import uiReducer from '@/store/ui/uiSlice';
import type { RootState } from '@/store';

export function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      news: newsReducer,
      ui: uiReducer,
    },
    preloadedState: preloadedState as PreloadedState<RootState>,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
}

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  route?: string;
  routerProps?: MemoryRouterProps;
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, route = '/', routerProps, queryClient: providedQueryClient, ...renderOptions }: RenderWithProvidersOptions = {},
) {
  const store = createTestStore(preloadedState);
  const queryClient =
    providedQueryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <ConfigProvider locale={ruRU}>
              <AntApp>
                <MemoryRouter initialEntries={[route]} {...routerProps}>
                  {children}
                </MemoryRouter>
              </AntApp>
            </ConfigProvider>
          </HelmetProvider>
        </QueryClientProvider>
      </Provider>
    );
  }

  return {
    store,
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export interface RenderHookWithProvidersOptions<Props> extends Omit<
  RenderWithProvidersOptions,
  'preloadedState' | 'route' | 'routerProps' | 'queryClient'
> {
  preloadedState?: Partial<RootState>;
  route?: string;
  routerProps?: MemoryRouterProps;
  queryClient?: QueryClient;
  hookOptions?: Omit<RenderHookOptions<Props>, 'wrapper'>;
}

export function renderHookWithProviders<Result, Props>(
  hook: (props: Props) => Result,
  { preloadedState, route = '/', routerProps, queryClient: providedQueryClient, hookOptions }: RenderHookWithProvidersOptions<Props> = {},
) {
  const store = createTestStore(preloadedState);
  const queryClient =
    providedQueryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <ConfigProvider locale={ruRU}>
              <AntApp>
                <MemoryRouter initialEntries={[route]} {...routerProps}>
                  {children}
                </MemoryRouter>
              </AntApp>
            </ConfigProvider>
          </HelmetProvider>
        </QueryClientProvider>
      </Provider>
    );
  }

  return {
    store,
    queryClient,
    ...renderHook(hook, { wrapper: Wrapper, ...hookOptions }),
  };
}
