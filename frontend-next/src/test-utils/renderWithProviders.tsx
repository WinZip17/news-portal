import {
  render,
  renderHook,
  type RenderHookOptions,
  type RenderOptions,
} from '@testing-library/react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import type { ReactElement, ReactNode } from 'react';
import authReducer from '@/store/auth/authSlice';
import newsReducer from '@/store/news/newsSlice';
import uiReducer from '@/store/ui/uiSlice';
import type { RootState } from '@/store';
import { darkTheme } from '@/theme';
import DateLocalizationProvider from '@/components/DateLocalizationProvider';

const rootReducer = combineReducers({
  auth: authReducer,
  news: newsReducer,
  ui: uiReducer,
});

export function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    ...(preloadedState !== undefined ? { preloadedState } : {}),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
}

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, ...renderOptions }: RenderWithProvidersOptions = {},
) {
  const store = createTestStore(preloadedState);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={darkTheme}>
          <DateLocalizationProvider>{children}</DateLocalizationProvider>
        </ThemeProvider>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export interface RenderHookWithProvidersOptions<Props> extends Omit<
  RenderWithProvidersOptions,
  'preloadedState'
> {
  preloadedState?: Partial<RootState>;
  hookOptions?: Omit<RenderHookOptions<Props>, 'wrapper'>;
}

export function renderHookWithProviders<Result, Props>(
  hook: (props: Props) => Result,
  { preloadedState, hookOptions }: RenderHookWithProvidersOptions<Props> = {},
) {
  const store = createTestStore(preloadedState);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={darkTheme}>
          <DateLocalizationProvider>{children}</DateLocalizationProvider>
        </ThemeProvider>
      </Provider>
    );
  }

  return {
    store,
    ...renderHook(hook, { wrapper: Wrapper, ...hookOptions }),
  };
}
