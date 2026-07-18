import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';

// Auth components
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicRoute from '../components/auth/PublicRoute';
import AdminDashboard from "../pages/admin/AdminDashboard.tsx";
import UsersManagement from "../pages/admin/UsersManagement.tsx";

// Lazy loaded pages
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const NewsList = lazy(() => import('../pages/NewsList'));

const PageLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400
  }}>
    <Spin size="large"/>
  </div>
);

export const routes = [
  {
    element: <AuthLayout/>,
    children: [
      {
        path: '/login',
        element: (
          <PublicRoute>
            <Suspense fallback={<PageLoader/>}>
              <Login/>
            </Suspense>
          </PublicRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <PublicRoute>
            <Suspense fallback={<PageLoader/>}>
              <Register/>
            </Suspense>
          </PublicRoute>
        ),
      },
    ],
  },
  {
    element: <MainLayout/>,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<PageLoader/>}>
            <Home/>
          </Suspense>
        ),
      },
      {
        path: '/news',
        element: (
          <Suspense fallback={<PageLoader/>}>
            <NewsList/>
          </Suspense>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <div>Профиль</div>
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute>
            <div>Настройки</div>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute requiredRoles={['admin', 'moderator']}>
            <Suspense fallback={<PageLoader/>}>
              <AdminDashboard/>
            </Suspense>
          </ProtectedRoute>
        ),
      }
    ],
  },
  {
    path: '*',
    element: <div>Страница не найдена</div>,
  },
];