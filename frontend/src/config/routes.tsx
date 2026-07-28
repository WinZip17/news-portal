import React, { Suspense } from 'react';
import Home from '@/pages/Home';
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import { PageLoader } from '@/components/PageLoader.tsx';
import { AdminDashboard, Login, NewsList, NotFound, Profile, Register } from '@/config/routes.lazy.ts';

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
        element: <Home />,
      },
      {
        path: '/news',
        element: <NewsList />,
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
