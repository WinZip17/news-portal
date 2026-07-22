import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';

// Layouts
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';

// Auth components
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PublicRoute from '@/components/auth/PublicRoute';

// Lazy loaded pages
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const NewsList = lazy(() => import('@/pages/NewsList'));
const Profile = lazy(() => import('@/pages/Profile'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const NotFound = lazy(() => import('@/pages/NotFound.tsx'));

const PageLoader: React.FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 400,
    }}
  >
    <Spin size="large" />
  </div>
);

export const routes = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <PublicRoute>
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          </PublicRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <PublicRoute>
            <Suspense fallback={<PageLoader />}>
              <Register />
            </Suspense>
          </PublicRoute>
        ),
      },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: '/news',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NewsList />
          </Suspense>
        ),
      },
      // Защищенные маршруты
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Profile />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Profile />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      // Админ-панель
      {
        path: '/admin',
        element: (
          <ProtectedRoute requiredRoles={['admin', 'moderator', 'super_admin']}>
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFound />
      </Suspense>
    ),
  },
];
