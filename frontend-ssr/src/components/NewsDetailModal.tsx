import React, { useEffect, useState } from 'react';
import { Spin, Typography, Tag, Space, Divider, Image, Alert } from 'antd';
import {
  ClockCircleOutlined,
  EyeOutlined,
  RobotOutlined,
  LinkOutlined,
  UserOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { News } from '../store/newsStore';

const { Title, Text, Paragraph } = Typography;

const NewsDetailModal: React.FC<{ newsId: string }> = ({ newsId }) => {
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/news/${newsId}`)
      .then((r) => setNews(r.data))
      .finally(() => setLoading(false));
  }, [newsId]);

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  if (!news) return <div>Новость не найдена</div>;

  return (
    <div>
      <Alert
        title={
          news.isAiGenerated
            ? '🤖 AI-рерайт новости'
            : '📄 Оригинальная новость'
        }
        description={
          news.isAiGenerated
            ? 'Эта новость создана с помощью искусственного интеллекта на основе реальных данных. Факты сохранены, формулировки изменены.'
            : 'Оригинальная новость из новостного источника.'
        }
        type={news.isAiGenerated ? 'info' : 'success'}
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Title level={3}>{news.title}</Title>
      <Space wrap style={{ marginBottom: 16, color: '#666', marginRight: 8 }}>
        <Text type="secondary">
          <ClockCircleOutlined />{' '}
          {new Date(news.publishedAt).toLocaleDateString('ru-RU')}
        </Text>
        <Text type="secondary">
          <EyeOutlined /> {news.views || 0}
        </Text>
        {news.author && (
          <Text type="secondary">
            <UserOutlined /> {news.author}
          </Text>
        )}
      </Space>
      <Space wrap style={{ marginBottom: 16 }}>
        <Tag color="blue">{news.category}</Tag>
        {news.isAiGenerated ? (
          <Tag icon={<RobotOutlined />} color="blue">
            AI
          </Tag>
        ) : (
          <Tag icon={<LinkOutlined />} color="green">
            Оригинал
          </Tag>
        )}
      </Space>
      <Divider />
      {news.imageUrl && (
        <Image
          src={news.imageUrl}
          style={{
            width: '100%',
            maxHeight: 400,
            objectFit: 'cover',
            borderRadius: 8,
            marginBottom: 16,
          }}
        />
      )}
      {news.summary && (
        <Paragraph strong style={{ fontSize: 16, marginBottom: 16 }}>
          {news.summary}
        </Paragraph>
      )}
      <div
        dangerouslySetInnerHTML={{ __html: news.content }}
        style={{ fontSize: 15, lineHeight: 1.8 }}
      />
      {news.sourceUrl && (
        <div style={{ marginTop: 16 }}>
          <a href={news.sourceUrl} target="_blank" rel="noopener noreferrer">
            Читать оригинал
          </a>
        </div>
      )}
    </div>
  );
};

export default NewsDetailModal;
