import React from 'react';
import { Card, Skeleton, Col } from 'antd';

const NewsSkeleton: React.FC = () => {
  return (
    <Col xs={24} sm={12} lg={8}>
      <Card style={{ height: '100%' }}>
        <Skeleton.Image className={'skeleton-image'} style={{ width: '100%', height: 200 }} active />
        <Skeleton active paragraph={{ rows: 3 }} style={{ marginTop: 16 }} />
      </Card>
    </Col>
  );
};

export default NewsSkeleton;
