'use client';
import { useRouter } from 'next/navigation';
import { Container, Typography, Button, Box } from '@mui/material';

export default function NotFound() {
  const router = useRouter();
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h2" sx={{ fontWeight: 700 }} gutterBottom>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
        Страница не найдена
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button onClick={() => router.push('/')} variant="contained">
          На главную
        </Button>
        <Button onClick={() => router.push('/news')} variant="outlined">
          К новостям
        </Button>
      </Box>
    </Container>
  );
}
