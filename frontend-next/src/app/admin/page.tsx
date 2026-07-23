'use client';
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Tooltip,
} from '@mui/material';
import { SmartToy as AIIcon, Rocket as RocketIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { newsService } from '@/services/newsService';
import { News, User } from '@/types';
import api from '@/services/api';
import { getCategoryLabel } from '@/utils/getCategoryLabel';
import { useAppSelector } from '@/store';
import { authService } from '@/services/authService';

export default function AdminPage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [tab, setTab] = useState(0);
  const [news, setNews] = useState<News[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [superTab, setSuperTab] = useState(0);
  const [editItem, setEditItem] = useState<News | User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    type: 'news' | 'user';
  }>({
    open: false,
    id: '',
    type: 'news',
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const data = await newsService.getNews({ limit: 50 });
        setNews(data.data);
      } else {
        const res = await api.get('/auth/users', { params: { limit: 50 } });
        setUsers(res.data.data);
      }
    } catch {}
    setLoading(false);
  };

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/ai/auto-generate', { countPerCategory: 2 });
      loadData();
    } catch {}
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!editItem) return;
    try {
      if ('title' in editItem) {
        await newsService.updateNews(editItem.id, editItem);
      } else {
        await authService.updateUser(editItem.id, editItem);
      }
      setNews((prev) => prev.map((n) => (n.id === editItem.id ? (editItem as News) : n)));
      setUsers((prev) => prev.map((u) => (u.id === editItem.id ? (editItem as User) : u)));
      setModalOpen(false);
    } catch {}
  };

  const handleDeleteClick = (id: string, type: 'news' | 'user') => {
    setDeleteConfirm({ open: true, id, type });
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteConfirm.type === 'news') {
        await newsService.deleteNews(deleteConfirm.id);
        setNews((prev) => prev.filter((n) => n.id !== deleteConfirm.id));
      } else {
        await authService.deleteUser(deleteConfirm.id);
        setUsers((prev) => prev.filter((u) => u.id !== deleteConfirm.id));
      }
    } catch {}
    setDeleteConfirm({ open: false, id: '', type: 'news' });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Черновик',
      pending: 'На модерации',
      published: 'Опубликовано',
      rejected: 'Отклонено',
      archived: 'Архив',
    };
    return labels[status] || status;
  };

  const handleModerate = async (id: string, status: string) => {
    try {
      await newsService.moderateNews(id, status);
      setNews((prev) => prev.map((n) => (n.id === id ? { ...n, status } : n)));
    } catch {}
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Админ-панель
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Новости" />
        <Tab label="Пользователи" />
        {isSuperAdmin && <Tab label="👑 Суперадмин" />}
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Заголовок</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {news.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Tooltip title={item.title} arrow>
                      <Typography
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 300,
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip label={getCategoryLabel(item.category)} size="small" />
                  </TableCell>
                  <TableCell>
                    {item.isAiGenerated ? (
                      <Chip icon={<AIIcon />} label="AI" size="small" color="secondary" />
                    ) : (
                      <Chip label="Оригинал" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(item.status)}
                      size="small"
                      color={
                        item.status === 'published'
                          ? 'success'
                          : item.status === 'pending'
                            ? 'warning'
                            : item.status === 'rejected'
                              ? 'error'
                              : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {item.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            color="success"
                            variant="outlined"
                            onClick={() => handleModerate(item.id, 'published')}
                          >
                            Опубликовать
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => handleModerate(item.id, 'rejected')}
                          >
                            Отклонить
                          </Button>
                        </>
                      )}
                      {item.status === 'published' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleModerate(item.id, 'archived')}
                        >
                          В архив
                        </Button>
                      )}
                      {item.status === 'archived' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleModerate(item.id, 'published')}
                        >
                          Восстановить
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Активен</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setEditItem(user);
                    setModalOpen(true);
                  }}
                >
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={user.role === 'admin' ? 'error' : 'primary'}
                    />
                  </TableCell>
                  <TableCell>{user.isActive ? '✅' : '❌'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {tab === 2 && isSuperAdmin && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: 'gold' }}>
            👑 Панель суперадмина
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<RocketIcon />}
              loading={generating}
              onClick={handleAutoGenerate}
            >
              Сгенерировать новости
            </Button>
          </Box>

          <Tabs value={superTab} onChange={(_, v) => setSuperTab(v)} sx={{ mb: 2 }}>
            <Tab label="Новости" />
            <Tab label="Пользователи" />
          </Tabs>

          {superTab === 0 && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Заголовок</TableCell>
                    <TableCell>Категория</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Дата</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {news.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>
                        <Chip label={item.category} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          size="small"
                          color={item.status === 'published' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => {
                            setEditItem(item);
                            setModalOpen(true);
                          }}
                        >
                          Изменить
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(item.id, 'news')}
                        >
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {superTab === 1 && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Активен</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={user.role === 'admin' ? 'error' : 'primary'}
                        />
                      </TableCell>
                      <TableCell>{user.isActive ? '✅' : '❌'}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => {
                            setEditItem(user);
                            setModalOpen(true);
                          }}
                        >
                          Изменить
                        </Button>
                        {user.role !== 'super_admin' && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(user.id, 'user')}
                          >
                            Удалить
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Редактировать</DialogTitle>
            <DialogContent>
              {editItem && 'title' in editItem ? (
                <>
                  <TextField
                    label="Заголовок"
                    value={(editItem as News).title}
                    fullWidth
                    margin="normal"
                    onChange={(e) => setEditItem({ ...editItem, title: e.target.value } as News)}
                  />
                  <TextField
                    label="Категория"
                    value={(editItem as News).category}
                    fullWidth
                    margin="normal"
                    onChange={(e) => setEditItem({ ...editItem, category: e.target.value } as News)}
                  />
                  <Select
                    value={(editItem as News).status}
                    fullWidth
                    sx={{ mt: 2 }}
                    onChange={(e) => setEditItem({ ...editItem, status: e.target.value } as News)}
                  >
                    <MenuItem value="draft">Черновик</MenuItem>
                    <MenuItem value="pending">На модерации</MenuItem>
                    <MenuItem value="published">Опубликовано</MenuItem>
                    <MenuItem value="rejected">Отклонено</MenuItem>
                    <MenuItem value="archived">Архив</MenuItem>
                  </Select>
                  <TextField
                    label="Контент"
                    value={(editItem as News).content}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                    onChange={(e) => setEditItem({ ...editItem, content: e.target.value } as News)}
                  />
                  <TextField
                    label="Источник"
                    value={(editItem as News).source || ''}
                    fullWidth
                    margin="normal"
                    onChange={(e) => setEditItem({ ...editItem, source: e.target.value } as News)}
                  />
                </>
              ) : (
                <>
                  <TextField
                    label="Email"
                    value={(editItem as User)?.email || ''}
                    fullWidth
                    margin="normal"
                    onChange={(e) => setEditItem({ ...editItem, email: e.target.value } as User)}
                  />
                  <TextField
                    label="Username"
                    value={(editItem as User)?.username || ''}
                    fullWidth
                    margin="normal"
                    onChange={(e) => setEditItem({ ...editItem, username: e.target.value } as User)}
                  />
                  <Select
                    value={(editItem as User)?.role || 'user'}
                    fullWidth
                    sx={{ mt: 2 }}
                    onChange={(e) => setEditItem({ ...editItem, role: e.target.value } as User)}
                  >
                    <MenuItem value="user">Пользователь</MenuItem>
                    <MenuItem value="moderator">Модератор</MenuItem>
                    <MenuItem value="admin">Админ</MenuItem>
                  </Select>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={(editItem as User)?.isActive || false}
                        onChange={(e) =>
                          setEditItem({ ...editItem, isActive: e.target.checked } as User)
                        }
                      />
                    }
                    label="Активен"
                    sx={{ mt: 1 }}
                  />
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setModalOpen(false)}>Отмена</Button>
              <Button variant="contained" onClick={handleSave}>
                Сохранить
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать</DialogTitle>
        <DialogContent>
          {editItem && 'title' in editItem ? (
            <>
              <TextField
                label="Заголовок"
                defaultValue={(editItem as News).title}
                fullWidth
                margin="normal"
                onChange={(e) => setEditItem({ ...editItem, title: e.target.value } as News)}
              />
              <TextField
                label="Категория"
                defaultValue={(editItem as News).category}
                fullWidth
                margin="normal"
                onChange={(e) => setEditItem({ ...editItem, category: e.target.value } as News)}
              />
              <Select
                value={(editItem as News).status}
                onChange={(e) => setEditItem({ ...editItem, status: e.target.value } as News)}
                fullWidth
                sx={{ mt: 2 }}
              >
                <MenuItem value="draft">Черновик</MenuItem>
                <MenuItem value="pending">На модерации</MenuItem>
                <MenuItem value="published">Опубликовано</MenuItem>
                <MenuItem value="rejected">Отклонено</MenuItem>
                <MenuItem value="archived">Архив</MenuItem>
              </Select>
              <TextField
                label="Контент"
                defaultValue={(editItem as News).content}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                onChange={(e) => setEditItem({ ...editItem, content: e.target.value } as News)}
              />
              <TextField
                label="Источник"
                defaultValue={(editItem as News).source || ''}
                fullWidth
                margin="normal"
                onChange={(e) => setEditItem({ ...editItem, source: e.target.value } as News)}
              />
            </>
          ) : (
            <>
              <TextField
                label="Email"
                defaultValue={(editItem as User)?.email || ''}
                fullWidth
                margin="normal"
                onChange={(e) => setEditItem({ ...editItem, email: e.target.value } as User)}
              />
              <TextField
                label="Username"
                defaultValue={(editItem as User)?.username || ''}
                fullWidth
                margin="normal"
                onChange={(e) => setEditItem({ ...editItem, username: e.target.value } as User)}
              />
              <Select
                value={(editItem as User)?.role || 'user'}
                onChange={(e) => setEditItem({ ...editItem, role: e.target.value } as User)}
                fullWidth
                sx={{ mt: 2 }}
              >
                <MenuItem value="user">Пользователь</MenuItem>
                <MenuItem value="moderator">Модератор</MenuItem>
                <MenuItem value="admin">Админ</MenuItem>
              </Select>
              <FormControlLabel
                control={
                  <Switch
                    checked={(editItem as User)?.isActive || false}
                    onChange={(e) =>
                      setEditItem({ ...editItem, isActive: e.target.checked } as User)
                    }
                  />
                }
                label="Активен"
                sx={{ mt: 1 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: '', type: 'news' })}
      >
        <DialogTitle>Подтверждение</DialogTitle>
        <DialogContent>Вы уверены, что хотите удалить?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, id: '', type: 'news' })}>
            Отмена
          </Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
