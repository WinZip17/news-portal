import React from 'react';
import { Card, Col, Typography, Space, Tag } from 'antd';
import { RobotOutlined, LinkOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { News } from '@/types';

const { Paragraph } = Typography;

type NewsCardPropsType = { item: News; openNews: (id: string) => void };

const NewsCard: React.FC<NewsCardPropsType> = ({ item, openNews }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'только что';
    if (diff < 60) return `${diff} мин. назад`;
    if (diff < 1440) return `${Math.floor(diff / 60)} ч. назад`;
    if (diff < 7 * 1440) return `${Math.floor(diff / 1440)} дн. назад`;
    return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      politics: 'blue',
      economy: 'green',
      technology: 'purple',
      science: 'cyan',
      sports: 'orange',
      entertainment: 'magenta',
      health: 'red',
      world: 'geekblue',
      other: 'default',
    };
    return colors[cat] || 'default';
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      politics: 'Политика',
      economy: 'Экономика',
      technology: 'Технологии',
      science: 'Наука',
      sports: 'Спорт',
      entertainment: 'Развлечения',
      health: 'Здоровье',
      world: 'Мир',
      other: 'Другое',
    };
    return labels[cat] || cat;
  };

  return (
    <Col xs={24} sm={12} lg={8}>
      <Card
        hoverable
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        styles={{ actions: { marginTop: 'auto' } }}
        cover={
          item.imageUrl ? (
            <img alt={item.title} src={item.imageUrl} loading={'lazy'} style={{ height: 200, objectFit: 'cover' }} />
          ) : (
            <div
              style={{
                height: 200,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '48px',
              }}
            >
              📰
            </div>
          )
        }
        onClick={() => openNews(item.id)}
        actions={[<span key="views">👁 {item.views || 0}</span>, <span key="likes">❤️ {item.likes || 0}</span>]}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Card.Meta
            title={item.title}
            description={
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 12 }}>
                  {item.summary?.substring(0, 120) || 'Описание отсутствует'}...
                </Paragraph>
                <Space wrap size={[4, 4]} style={{ marginTop: 'auto' }}>
                  <Tag color={getCategoryColor(item.category)}>{getCategoryLabel(item.category)}</Tag>
                  {item.isAiGenerated ? (
                    <Tag icon={<RobotOutlined />} color="blue">
                      AI-рерайт
                    </Tag>
                  ) : (
                    <Tag icon={<LinkOutlined />} color="green">
                      Оригинал
                    </Tag>
                  )}
                  {item.source && <Tag color="purple">{item.source}</Tag>}
                </Space>
                <div style={{ marginTop: 8, color: '#999', fontSize: '12px' }}>
                  <ClockCircleOutlined /> {formatDate(item.publishedAt)}
                </div>
              </div>
            }
          />
        </div>
      </Card>
    </Col>
  );
};

export default NewsCard;
