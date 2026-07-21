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
} from '@ant-design/icons';
import { newsService } from '@/services/newsService.ts';
import type { ColumnsType } from 'antd/es/table';
import { News, NewsStatus } from '@/types';

const NewsManagement: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<NewsStatus>(NewsStatus.PENDING);

  useEffect(() => {
    loadNews();
  }, [statusFilter]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const response = await newsService.getNews({
        status: statusFilter,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      setNews(response.data);
    } catch (error) {
      message.error('Ошибка загрузки');
    }
    setLoading(false);
  };

  const handleModerate = async (id: string, status: NewsStatus) => {
    try {
      await newsService.moderateNews(id, status);
      message.success(status === NewsStatus.PUBLISHED ? 'Опубликовано/Восстановлено' : 'Отклонено');
      loadNews();
    } catch (error) {
      message.error('Ошибка');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await newsService.deleteNews(id);
      message.success('Новость удалена');
      loadNews();
    } catch (error) {
      message.error('Ошибка удаления');
    }
  };

  const columns: ColumnsType<News> = [
    { title: 'Заголовок', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Категория', dataIndex: 'category', key: 'category', width: 120, render: (cat) => <Tag>{cat}</Tag> },
    {
      title: 'Тип',
      dataIndex: 'isAiGenerated',
      key: 'type',
      width: 100,
      render: (ai) =>
        ai ? (
          <Tag icon={<RobotOutlined />} color="blue">
            AI
          </Tag>
        ) : (
          <Tag color="green">Пользователь</Tag>
        ),
    },
    { title: 'Дата', dataIndex: 'createdAt', key: 'date', width: 110, render: (d) => new Date(d).toLocaleDateString('ru-RU') },
    { title: 'Просмотры', dataIndex: 'views', key: 'views', width: 80 },
    {
      title: 'Действия',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space>
          {record.status === NewsStatus.PENDING && (
            <>
              <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleModerate(record.id, NewsStatus.PUBLISHED)}>
                Опубликовать
              </Button>
              <Button danger size="small" icon={<CloseCircleOutlined />} onClick={() => handleModerate(record.id, NewsStatus.REJECTED)}>
                Отклонить
              </Button>
            </>
          )}
          {record.status === NewsStatus.PUBLISHED && (
            <>
              <Button size="small" onClick={() => handleModerate(record.id, NewsStatus.ARCHIVED)}>
                В архив
              </Button>
              <Button size="small" onClick={() => handleModerate(record.id, NewsStatus.PENDING)}>
                На модерацию
              </Button>
            </>
          )}
          {record.status === NewsStatus.ARCHIVED && (
            <>
              <Button size="small" icon={<UndoOutlined />} onClick={() => handleModerate(record.id, NewsStatus.PUBLISHED)}>
                Восстановить
              </Button>
              <Popconfirm title="Удалить навсегда?" onConfirm={() => handleDelete(record.id)}>
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
      key: NewsStatus.PENDING,
      label: (
        <span>
          <ClockCircleOutlined /> На модерации
        </span>
      ),
    },
    {
      key: NewsStatus.PUBLISHED,
      label: (
        <span>
          <CheckCircleOutlined /> Опубликованные
        </span>
      ),
    },
    {
      key: NewsStatus.REJECTED,
      label: (
        <span>
          <CloseCircleOutlined /> Отклоненные
        </span>
      ),
    },
    {
      key: NewsStatus.ARCHIVED,
      label: (
        <span>
          <InboxOutlined /> Архив
        </span>
      ),
    },
  ];

  return (
    <div>
      <Tabs activeKey={statusFilter} onChange={(key) => setStatusFilter(key as NewsStatus)} items={tabItems} />
      <Table columns={columns} dataSource={news} rowKey="id" loading={loading} scroll={{ x: 800 }} />
    </div>
  );
};

export default NewsManagement;
