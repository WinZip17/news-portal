import React from 'react';
import { Button, Space } from 'antd';

const FrameworkSwitcher: React.FC = () => {
  return (
    <Space style={{ display: 'none' }}>
      <Button type="primary" size="small" onClick={() => (window.location.href = 'https://short-news.ru')}>
        ⚛️ React SPA
      </Button>
      <Button size="small" onClick={() => (window.location.href = 'https://short-news.ru:3002')}>
        🟢 NestJS SSR
      </Button>
      <Button size="small" disabled>
        🟣 Nuxt (soon)
      </Button>
    </Space>
  );
};

export default FrameworkSwitcher;
