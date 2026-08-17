import { lazy } from 'react';

export const Login = lazy(() => import('@/pages/Login'));
export const Register = lazy(() => import('@/pages/Register'));
export const NewsList = lazy(() => import('@/pages/NewsList'));
export const SmartSearch = lazy(() => import('@/pages/SmartSearch'));
export const Profile = lazy(() => import('@/pages/Profile'));
export const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
export const NotFound = lazy(() => import('@/pages/NotFound.tsx'));
