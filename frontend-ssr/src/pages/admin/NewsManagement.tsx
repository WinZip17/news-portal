import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Tabs, message, Popconfirm } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  RobotOutlined,
  DeleteOutlined,
  UndoOutlined,
  InboxOutlined,
  EditOutlined,
} from '@ant-design/icons';
import api from '../../services/api';
import type { ColumnsType } from 'antd/es/table';

interface News {
  id: string;
  title: string;
  category: string;
  status: string;
  isAiGenerated: boolean;
  views: number;
  createdAt: string;
}

const NewsManagement: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    loadNews();
  }, [statusFilter]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/news', {
        params: { status: statusFilter, limit: 50 },
      });
      setNews(res.data.data);
    } catch {
      message.error('Ошибка загрузки');
    }
    setLoading(false);
  };

  const handleModerate = async (id: string, status: string) => {
    try {
      await api.patch(`/news/${id}/moderate`, { status });
      message.success('Готово');
      loadNews();
    } catch {
      message.error('Ошибка');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/news/${id}`);
      message.success('Удалено');
      loadNews();
    } catch {
      message.error('Ошибка удаления');
    }
  };

  const columns: ColumnsType<News> = [
    { title: 'Заголовок', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (c: string) => <Tag>{c}</Tag>,
    },
    {
      title: 'Тип',
      dataIndex: 'isAiGenerated',
      key: 'type',
      width: 100,
      render: (ai: boolean) =>
        ai ? (
          <Tag icon={<RobotOutlined />} color="blue">
            AI
          </Tag>
        ) : (
          <Tag color="green">Пользователь</Tag>
        ),
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'date',
      width: 110,
      render: (d: string) => new Date(d).toLocaleDateString('ru-RU'),
    },
    { title: 'Просмотры', dataIndex: 'views', key: 'views', width: 80 },
    {
      title: 'Действия',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space size={4}>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleModerate(record.id, 'published')}
              >
                Опубликовать
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleModerate(record.id, 'rejected')}
              >
                Отклонить
              </Button>
            </>
          )}
          {record.status === 'published' && (
            <>
              <Button
                size="small"
                onClick={() => handleModerate(record.id, 'archived')}
              >
                В архив
              </Button>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleModerate(record.id, 'pending')}
              >
                На модерацию
              </Button>
            </>
          )}
          {record.status === 'archived' && (
            <>
              <Button
                size="small"
                icon={<UndoOutlined />}
                onClick={() => handleModerate(record.id, 'published')}
              >
                Восстановить
              </Button>
              <Popconfirm
                title="Удалить навсегда?"
                onConfirm={() => handleDelete(record.id)}
              >
                <Button size="small" danger icon={<DeleteOutlined />}>
                  Удалить
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined /> На модерации
        </span>
      ),
    },
    {
      key: 'published',
      label: (
        <span>
          <CheckCircleOutlined /> Опубликованные
        </span>
      ),
    },
    {
      key: 'rejected',
      label: (
        <span>
          <CloseCircleOutlined /> Отклоненные
        </span>
      ),
    },
    {
      key: 'archived',
      label: (
        <span>
          <InboxOutlined /> Архив
        </span>
      ),
    },
  ];

  return (
    <div>
      <Tabs
        activeKey={statusFilter}
        onChange={setStatusFilter}
        items={tabItems}
      />
      <Table
        columns={columns}
        dataSource={news}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default NewsManagement;
