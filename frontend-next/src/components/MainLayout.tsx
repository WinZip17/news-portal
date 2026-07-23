'use client';
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Switch,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Article as NewsIcon,
  Person as ProfileIcon,
  Login as LoginIcon,
  Dashboard as AdminIcon,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import FrameworkSwitcher from './FrameworkSwitcher';
import { useAppDispatch, useAppSelector, toggleTheme } from '@/store';

const navItems = [
  { path: '/', label: 'Главная', icon: <HomeIcon /> },
  { path: '/news', label: 'Новости', icon: <NewsIcon /> },
  { path: '/profile', label: 'Профиль', icon: <ProfileIcon />, auth: true },
  { path: '/admin', label: 'Админ-панель', icon: <AdminIcon />, admin: true },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((s) => s.ui.theme);
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredNav = navItems.filter((item) => {
    if (item.auth && !isAuthenticated) return false;
    if (item.admin && !isAdmin) return false;
    if (item.path === '/login' && isAuthenticated) return false;
    return true;
  });

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  const drawer = (
    <Box sx={{ width: 240 }}>
      <Box sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }} onClick={() => router.push('/')}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          📰 News Portal
        </Typography>
      </Box>
      <List>
        {filteredNav.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => {
              router.push(item.path);
              setDrawerOpen(false);
            }}
            sx={{
              cursor: 'pointer',
              bgcolor: pathname === item.path ? 'action.selected' : 'transparent',
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {!isMobile && (
        <Drawer variant="permanent" sx={{ width: 240, '& .MuiDrawer-paper': { width: 240 } }}>
          {drawer}
        </Drawer>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawer}
      </Drawer>

      <Box sx={{ flex: 1 }}>
        <AppBar position="sticky">
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flex: 1 }}>
              {pathname === '/' && 'Главная'}
              {pathname === '/news' && 'Новости'}
              {pathname === '/profile' && 'Профиль'}
              {pathname === '/admin' && 'Админ-панель'}
            </Typography>

            <FrameworkSwitcher current="next" />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Switch
                checked={themeMode === 'dark'}
                onChange={() => dispatch(toggleTheme())}
                icon={<LightMode />}
                checkedIcon={<DarkMode />}
              />
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.username?.[0]?.toUpperCase() || 'G'}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                {isAuthenticated
                  ? [
                      <MenuItem key="profile" onClick={() => router.push('/profile')}>
                        Профиль
                      </MenuItem>,
                      <MenuItem key="logout" onClick={handleLogout}>
                        Выйти
                      </MenuItem>,
                    ]
                  : [
                      <MenuItem key="login" onClick={() => router.push('/login')}>
                        Войти
                      </MenuItem>,
                    ]}
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {children}
        </Container>

        <Box component="footer" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
          News Portal ©{new Date().getFullYear()} - Создано с ❤️ и AI
        </Box>
      </Box>
    </Box>
  );
}
