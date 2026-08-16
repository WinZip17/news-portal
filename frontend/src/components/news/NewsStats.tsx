import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { useNewsStatsQuery } from '@/hooks/useNewsQuery';
import { ClockCircleOutlined, EyeOutlined, ReadOutlined, RobotOutlined, TeamOutlined } from '@ant-design/icons';

const NewsStats: React.FC = () => {
  const { data: stats, isLoading } = useNewsStatsQuery();

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
      {[
        { title: 'Сегодня', value: stats?.newsToday || 0, prefix: <ReadOutlined /> },
        { title: 'Пользователей', value: stats?.totalUsers || 0, prefix: <TeamOutlined /> },
        { title: 'AI-рерайт', value: stats?.totalAiNews || 0, prefix: <RobotOutlined /> },
        { title: 'Всего новостей', value: stats?.totalNews || 0, prefix: <ReadOutlined /> },
        { title: 'Просмотров', value: stats?.totalViews || 0, prefix: <EyeOutlined /> },
        {
          title: 'На модерации',
          value: stats?.pendingNews || 0,
          prefix: <ClockCircleOutlined />,
          valueStyle: stats?.pendingNews ? { color: '#faad14' } : undefined,
        },
      ].map((item) => (
        <Col xs={12} sm={12} md={8} lg={8} xl={4} key={item.title}>
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
