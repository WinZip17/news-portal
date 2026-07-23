'use client';
import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Alert, Box, Link } from '@mui/material';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    setLoading(true);
    setError('');
    try {
      await authService.register({
        email: form.get('email') as string,
        username: form.get('username') as string,
        password: form.get('password') as string,
      });
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
        <TextField name="email" label="Email" type="email" fullWidth required margin="normal" />
        <TextField name="username" label="Имя пользователя" fullWidth required margin="normal" />
        <TextField
          name="password"
          label="Пароль"
          type="password"
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
