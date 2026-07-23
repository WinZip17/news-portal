import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './auth/authSlice';
import newsReducer from './news/newsSlice';
import uiReducer from './ui/uiSlice';
export { toggleTheme, setTheme } from './ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    news: newsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
