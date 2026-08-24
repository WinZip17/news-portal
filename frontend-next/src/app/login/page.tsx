'use client';
import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Alert, Box, Link } from '@mui/material';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useAppDispatch } from '@/store';
import { fetchCurrentUser } from '@/store/auth/authSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      await dispatch(fetchCurrentUser());
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Typography variant="h4" sx={{ textAlign: 'center' }} gutterBottom>
        Вход
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
          name="password"
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          loading={loading}
          sx={{ mt: 2 }}
        >
          Войти
        </Button>
      </Box>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Link href="/register" underline="hover">
          Нет аккаунта? Зарегистрироваться
        </Link>
      </Box>
    </Container>
  );
}
