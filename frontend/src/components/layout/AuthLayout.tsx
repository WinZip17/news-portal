import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Row, Col, Card, Typography } from 'antd';
import { useAppSelector } from '@/store';

const { Content } = Layout;
const { Title, Text } = Typography;

const AuthLayout: React.FC = () => {
  const theme = useAppSelector((state) => state.ui.theme);

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: theme === 'dark' ? 'linear-gradient(135deg, #141414 0%, #1f1f1f 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Content>
        <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: '20px' }}>
          <Col xs={24} sm={20} md={16} lg={12} xl={8}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                background: theme === 'dark' ? '#1f1f1f' : '#fff',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={2} style={{ marginBottom: 8 }}>
                  📰 News Portal
                </Title>
                <Text type="secondary">Ваш источник актуальных новостей</Text>
              </div>
              <Outlet />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
