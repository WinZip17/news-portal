'use client';
import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Alert, Box, Link } from '@mui/material';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useAppDispatch } from '@/store';
import { fetchCurrentUser, setTokens } from '@/store/auth/authSlice';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.register({ email, username, password });
      dispatch(setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken }));
      await dispatch(fetchCurrentUser()).unwrap();
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Typography variant="h4" sx={{ textAlign: 'center' }} gutterBottom>
        Регистрация
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="username"
          label="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="password"
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          margin="normal"
          slotProps={{ htmlInput: { minLength: 8 } }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          loading={loading}
          sx={{ mt: 2 }}
        >
          Зарегистрироваться
        </Button>
      </Box>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link href="/login" underline="hover">
          Уже есть аккаунт? Войти
        </Link>
      </Box>
    </Container>
  );
}
