'use client';
import React, { useState } from 'react';
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
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Article as NewsIcon,
  Person as ProfileIcon,
  Dashboard as AdminIcon,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import FrameworkSwitcher from './FrameworkSwitcher';
import { useAppDispatch, useAppSelector, toggleTheme } from '@/store';
import { useServerDatetime } from '@/hooks/useServerDatetime';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const serverDatetime = useServerDatetime();

  const filteredNav = navItems.filter((item) => {
    if (item.auth && !isAuthenticated) return false;
    if (item.admin && !isAdmin) return false;
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
          📰 Short News
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
            aria-label={item.label}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="main"
      sx={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}
    >
      {!isMobile && (
        <Drawer
          className={'fix-drawer'}
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: 241 },
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawer}
      </Drawer>

      <Box sx={{ flex: 1, maxWidth: '100%' }}>
        <AppBar position="sticky">
          <Toolbar sx={{ gap: 1, px: { xs: 1, sm: 2 }, minHeight: { xs: 48, sm: 64 } }}>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setDrawerOpen(true)}
                aria-label="Открыть меню"
                size="small"
              >
                <MenuIcon />
              </IconButton>
            )}
            {!isMobile && (
              <Typography
                variant="h5"
                sx={{ whiteSpace: 'nowrap', fontSize: { sm: '1rem', md: '1.25rem' } }}
              >
                {pathname === '/' && 'Главная'}
                {pathname === '/news' && 'Новости'}
                {pathname === '/profile' && 'Профиль'}
                {pathname === '/admin' && 'Админ-панель'}
              </Typography>
            )}

            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <FrameworkSwitcher current="next" />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                onClick={() => dispatch(toggleTheme())}
                aria-label={themeMode === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
              >
                {themeMode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-label="Открыть меню пользователя"
                size={isMobile ? 'small' : 'medium'}
              >
                <Avatar
                  sx={{
                    width: isMobile ? 24 : 32,
                    height: isMobile ? 24 : 32,
                    bgcolor: 'primary.main',
                    fontSize: isMobile ? 14 : 16,
                  }}
                >
                  {user?.username?.[0]?.toUpperCase() || 'G'}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                {isAuthenticated
                  ? [
                      <MenuItem
                        key="profile"
                        onClick={() => router.push('/profile')}
                        aria-label="Открыть профиль"
                      >
                        Профиль
                      </MenuItem>,
                      <MenuItem key="logout" onClick={handleLogout} aria-label="Выйти">
                        Выйти
                      </MenuItem>,
                    ]
                  : [
                      <MenuItem
                        key="login"
                        onClick={() => router.push('/login')}
                        aria-label="Войти"
                      >
                        Войти
                      </MenuItem>,
                    ]}
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Container
          maxWidth={false}
          sx={{ py: { xs: 1.5, md: 4 }, px: { xs: 1, sm: 2, md: 3 }, maxWidth: '100%' }}
        >
          {children}
        </Container>

        <Box
          component="footer"
          sx={{
            textAlign: 'center',
            py: { xs: 1, md: 2 },
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          }}
        >
          Short News ©{new Date().getFullYear()} — Создано с ❤️ и AI
          {serverDatetime && (
            <>
              {' · '}
              <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums' }} aria-live="polite">
                {serverDatetime}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
