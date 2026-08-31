import React from 'react';
import { useNavigate } from 'react-router';
import { Card, Row, Col, Statistic } from 'antd';
import { useNewsStatsQuery } from '@/hooks/useNewsQuery';
import { ClockCircleOutlined, EyeOutlined, ReadOutlined, RobotOutlined, TeamOutlined } from '@ant-design/icons';
import { useNews } from '@/hooks/useNews.ts';
import dayjs from 'dayjs';
import { useAuth } from '@/hooks/useAuth.ts';

const NewsStats: React.FC = () => {
  const { data: stats, isLoading } = useNewsStatsQuery();
  const { setDateFilter, setAiFilter } = useNews();
  const { user } = useAuth();
  const isModerator = user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'super_admin';
  const navigate = useNavigate();
  const setLink = (link: string) => {
    switch (link) {
      case 'current':
        setDateFilter({
          to: dayjs(new Date()).format('YYYY-MM-DD'),
          from: dayjs(new Date()).format('YYYY-MM-DD'),
        });
        navigate({
          pathname: '/news',
        });
        break;
      case 'list':
        navigate({
          pathname: '/news',
        });
        break;
      case 'ai':
        setAiFilter('true');
        navigate({
          pathname: '/news',
        });
        break;
      case 'moderation':
        if (isModerator) {
          navigate({
            pathname: '/admin',
          });
        }
        break;
      default:
        break;
    }
  };

  const statsList = [
    { title: 'Сегодня', value: stats?.newsToday || 0, prefix: <ReadOutlined />, link: 'current' },
    { title: 'Пользователей', value: stats?.totalUsers || 0, prefix: <TeamOutlined />, link: '' },
    { title: 'AI-рерайт', value: stats?.totalAiNews || 0, prefix: <RobotOutlined />, link: 'ai' },
    { title: 'Всего новостей', value: stats?.totalNews || 0, prefix: <ReadOutlined />, link: 'list' },
    { title: 'Просмотров', value: stats?.totalViews || 0, prefix: <EyeOutlined />, link: 'list' },
    {
      title: 'На модерации',
      value: stats?.pendingNews || 0,
      prefix: <ClockCircleOutlined />,
      valueStyle: stats?.pendingNews ? { color: '#faad14' } : undefined,
      link: 'moderation',
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
      {statsList.map((item) => (
        <Col onClick={() => setLink(item.link)} xs={12} sm={12} md={8} lg={8} xl={4} key={item.title}>
          <Card hoverable style={{ height: '100%' }}>
            <Statistic
              title={item.title}
              value={item.value}
              prefix={item.prefix}
              loading={isLoading}
              styles={{
                title: { whiteSpace: 'normal', lineHeight: 1.3, minHeight: '2.6em' },
              }}
              valueStyle={item.valueStyle}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default NewsStats;
