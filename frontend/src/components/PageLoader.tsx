import React from 'react';
import { Spin } from 'antd';

export const PageLoader: React.FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 400,
    }}
  >
    <Spin size="large" />
  </div>
);
