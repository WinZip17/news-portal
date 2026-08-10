import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from '@/store/auth/authSlice';
import newsReducer from '@/store/news/newsSlice';
import uiReducer from '@/store/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    news: newsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем некоторые actions для non-serializable данных
        ignoredActions: ['auth/setUser'],
      },
    }),
  devTools: !!import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export * from './auth/authSlice';
export * from './news/newsSlice';
export * from './ui/uiSlice';
