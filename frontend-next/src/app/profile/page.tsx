'use client';
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon, SmartToy as AIIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { newsService } from '@/services/newsService';
import { News, User } from '@/types';
import { getCategoryLabel } from '@/utils/getCategoryLabel';
import { setTheme, useAppDispatch, useAppSelector } from '@/store';

export default function ProfilePage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [favorites, setFavorites] = useState<News[]>([]);
  const [tab, setTab] = useState(0);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [prefsError, setPrefsError] = useState('');
  const [prefsSuccess, setPrefsSuccess] = useState('');
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((s) => s.ui.theme);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    newsService.getFavorites().then((res) => setFavorites(res.data));
  }, []);

  const handleRemoveFavorite = async (id: string) => {
    await newsService.toggleFavorite(id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const currentPassword = form.get('currentPassword') as string;
    const newPassword = form.get('newPassword') as string;
    const confirmPassword = form.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    setPasswordError('');
    setPasswordSuccess('');
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setPasswordSuccess('Пароль изменен');
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Ошибка смены пароля');
    }
  };

  if (!user) return <Skeleton variant="rectangular" height={400} />;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const firstName = form.get('firstName') as string;
    const lastName = form.get('lastName') as string;

    setProfileError('');
    setProfileSuccess('');
    try {
      await authService.updateProfile({ firstName, lastName });
      await authService.getMe();
      setProfileSuccess('Профиль обновлен');
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Ошибка обновления');
    }
  };
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const theme = form.get('theme') as string;
    const notificationsEnabled = form.get('notificationsEnabled') === 'on';

    setPrefsError('');
    setPrefsSuccess('');
    try {
      await authService.updatePreferences({
        theme,
        notificationsEnabled,
      });
      await authService.getMe();
      setPrefsSuccess('Настройки сохранены');
    } catch (err: unknown) {
      setPrefsError(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
  };
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Личный кабинет
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Профиль" />
        <Tab label="Пароль" />
        <Tab label="Настройки" />
        <Tab label={`Избранное (${favorites.length})`} />
      </Tabs>

      {tab === 0 && (
        <Box component="form" onSubmit={handleSaveProfile} sx={{ maxWidth: 400 }}>
          {profileError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {profileError}
            </Alert>
          )}
          {profileSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {profileSuccess}
            </Alert>
          )}
          <TextField
            name="firstName"
            label="Имя"
            defaultValue={user.firstName}
            fullWidth
            margin="normal"
          />
          <TextField
            name="lastName"
            label="Фамилия"
            defaultValue={user.lastName}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Username"
            defaultValue={user.username}
            fullWidth
            margin="normal"
            disabled
          />
          <TextField label="Email" defaultValue={user.email} fullWidth margin="normal" disabled />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Сохранить
          </Button>
        </Box>
      )}

      {tab === 1 && (
        <Box component="form" onSubmit={handleChangePassword} sx={{ maxWidth: 400 }}>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {passwordSuccess}
            </Alert>
          )}
          <TextField
            name="currentPassword"
            label="Текущий пароль"
            type="password"
            fullWidth
            required
            margin="normal"
          />
          <TextField
            name="newPassword"
            label="Новый пароль"
            type="password"
            fullWidth
            required
            margin="normal"
          />
          <TextField
            name="confirmPassword"
            label="Подтвердите пароль"
            type="password"
            fullWidth
            required
            margin="normal"
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Сменить пароль
          </Button>
        </Box>
      )}

      {tab === 2 && (
        <Box component="form" onSubmit={handleSavePreferences} sx={{ maxWidth: 400 }}>
          {prefsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {prefsError}
            </Alert>
          )}
          {prefsSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {prefsSuccess}
            </Alert>
          )}
          <Select
            name="theme"
            value={currentTheme}
            onChange={(e) => dispatch(setTheme(e.target.value as 'light' | 'dark'))}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="light">Светлая</MenuItem>
            <MenuItem value="dark">Темная</MenuItem>
          </Select>
          <Box>
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Сохранить
            </Button>
          </Box>
        </Box>
      )}

      {tab === 3 && (
        <List>
          {favorites.map((item) => (
            <ListItem
              key={item.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveFavorite(item.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={item.title}
                secondary={
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    <Chip label={getCategoryLabel(item.category)} size="small" />
                    {item.isAiGenerated && (
                      <Chip icon={<AIIcon />} label="AI" size="small" color="secondary" />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
}
