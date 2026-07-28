import React from 'react';
import { Card, Skeleton, Col, Row } from 'antd';

const NewsSkeleton: React.FC = () => {
  return (
    <Row gutter={[24, 24]}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Col xs={24} sm={12} lg={8} key={i}>
          <Card style={{ height: '100%' }}>
            <Skeleton.Image className={'skeleton-image'} style={{ width: '100%', height: 430 }} active />
            <Skeleton active paragraph={{ rows: 3 }} style={{ marginTop: 16 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default NewsSkeleton;
