import React from 'react';
import { Card, Col, Typography, Space, Tag } from 'antd';
import { News } from '@/types';
import { getCategoryLabel } from '@/utils/getCategoryLabel.ts';
import { getCategoryColor } from '@/utils/getCategoryColor.ts';
import { ClockCircleOutlined, EyeOutlined, HeartOutlined, LinkOutlined, RobotOutlined } from '@ant-design/icons';
import { getTimeAgoString } from '@/utils/formatDate.ts';

type NewsCardPropsType = { item: News; openNews: (id: string) => void };
const { Text, Paragraph } = Typography;

const NewsListCard: React.FC<NewsCardPropsType> = ({ item, openNews }) => {
  return (
    <Col style={{ width: '100%' }}>
      <Card
        hoverable
        onClick={() => openNews(item.id)}
        style={{ height: '100%', borderRadius: 8 }}
        styles={{ body: { padding: 16, display: 'flex', flexDirection: 'column', height: '100%' } }}
      >
        <Text strong style={{ fontSize: '15px', wordBreak: 'break-word', flexShrink: 0 }}>
          {item.title}
        </Text>
        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{ flex: 1, margin: '8px 0', color: '#666', fontSize: '13px', lineHeight: '1.5', wordBreak: 'break-word' }}
        >
          {item.summary || item.content?.substring(0, 150) || 'Описание отсутствует'}
        </Paragraph>
        <Space wrap size={[4, 4]} style={{ marginTop: 'auto' }}>
          <Tag color={getCategoryColor(item.category)}>{getCategoryLabel(item.category)}</Tag>
          {item.isAiGenerated ? (
            <Tag icon={<RobotOutlined />} color="blue">
              AI
            </Tag>
          ) : (
            <Tag icon={<LinkOutlined />} color="green">
              Оригинал
            </Tag>
          )}
          <Text type="secondary" style={{ fontSize: '11px' }}>
            <ClockCircleOutlined /> {getTimeAgoString(item.publishedAt)}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            <EyeOutlined /> {item.views || 0}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            <HeartOutlined /> {item.likes || 0}
          </Text>
        </Space>
      </Card>
    </Col>
  );
};

export default NewsListCard;
