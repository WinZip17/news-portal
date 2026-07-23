import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import NewsList from './pages/NewsList';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import { useUserStore } from './store/userStoreProvider';
import { useUIStore } from './store/uiStoreProvider';
import { ConfigProvider, theme as antTheme } from 'antd';

const App: React.FC = () => {
  const fetchUser = useUserStore((s) => s.fetchUser);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !isAuthenticated) {
      fetchUser();
    }
  }, []);
  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
      }}
    >
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
};

export default App;
