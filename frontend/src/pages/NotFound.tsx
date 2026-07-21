import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 24,
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Страница, которую вы ищете, не существует или была перемещена."
        extra={[
          <Button key="home" type="primary" icon={<HomeOutlined />} onClick={() => navigate('/')}>
            На главную
          </Button>,
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Назад
          </Button>,
          <Button key="news" onClick={() => navigate('/news')}>
            К новостям
          </Button>,
        ]}
      />
    </div>
  );
};

export default NotFound;
