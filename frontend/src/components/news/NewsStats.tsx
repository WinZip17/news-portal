import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { useNews } from '@/hooks/useNews.ts';
import { ClockCircleOutlined, EyeOutlined, ReadOutlined, RobotOutlined, TeamOutlined } from '@ant-design/icons';

const NewsStats: React.FC = () => {
  const { stats, fetchStats, isLoadingStats } = useNews();

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
      <Col xs={12} sm={8} md={4}>
        <Card hoverable>
          <Statistic title="Сегодня" value={stats?.newsToday || 0} prefix={<ReadOutlined />} loading={isLoadingStats} />
        </Card>
      </Col>
      <Col xs={12} sm={8} md={4}>
        <Card hoverable>
          <Statistic title="Пользователей" value={stats?.totalUsers || 0} prefix={<TeamOutlined />} loading={isLoadingStats} />
        </Card>
      </Col>
      <Col xs={12} sm={8} md={4}>
        <Card hoverable>
          <Statistic title="AI-рерайт" value={stats?.totalAiNews || 0} prefix={<RobotOutlined />} loading={isLoadingStats} />
        </Card>
      </Col>
      <Col xs={12} sm={8} md={4}>
        <Card hoverable>
          <Statistic title="Всего новостей" value={stats?.totalNews || 0} prefix={<ReadOutlined />} loading={isLoadingStats} />
        </Card>
      </Col>
      <Col xs={12} sm={8} md={4}>
        <Card hoverable>
          <Statistic title="Просмотров" value={stats?.totalViews || 0} prefix={<EyeOutlined />} loading={isLoadingStats} />
        </Card>
      </Col>
      <Col xs={12} sm={8} md={4}>
        <Card hoverable>
          <Statistic
            title="На модерации"
            value={stats?.pendingNews || 0}
            prefix={<ClockCircleOutlined />}
            styles={stats?.pendingNews ? { content: { color: '#faad14' } } : undefined}
            loading={isLoadingStats}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default NewsStats;
