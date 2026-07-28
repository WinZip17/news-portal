import React from 'react';
import { Card, Col, Typography, Space, Tag } from 'antd';
import { RobotOutlined, LinkOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { News } from '@/types';
import { TAG_STYLE } from '@/constants/styles.ts';
import { getCategoryColor } from '@/utils/getCategoryColor.ts';
import { getCategoryLabel } from '@/utils/getCategoryLabel.ts';
import { getTimeAgoString } from '@/utils/formatDate.ts';

const { Paragraph } = Typography;

type NewsCardPropsType = { item: News; openNews: (id: string) => void };

const NewsCard: React.FC<NewsCardPropsType> = ({ item, openNews }) => {
  return (
    <Col xs={24} sm={12} lg={8}>
      <Card
        hoverable
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        styles={{ actions: { marginTop: 'auto' } }}
        cover={
          item.imageUrl ? (
            <img alt={item.title} src={item.imageUrl} loading={'lazy'} style={{ height: 200, objectFit: 'cover' }} />
          ) : (
            <div
              style={{
                height: 200,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '48px',
              }}
            >
              📰
            </div>
          )
        }
        onClick={() => openNews(item.id)}
        actions={[<span key="views">👁 {item.views || 0}</span>, <span key="likes">❤️ {item.likes || 0}</span>]}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Card.Meta
            title={item.title}
            description={
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 12 }}>
                  {item.summary?.substring(0, 120) || 'Описание отсутствует'}...
                </Paragraph>
                <Space wrap size={[4, 4]} style={{ marginTop: 'auto' }}>
                  <Tag color={getCategoryColor(item.category)} style={TAG_STYLE}>
                    {getCategoryLabel(item.category)}
                  </Tag>
                  {item.isAiGenerated ? (
                    <Tag icon={<RobotOutlined />} color="blue" style={TAG_STYLE}>
                      AI-рерайт
                    </Tag>
                  ) : (
                    <Tag icon={<LinkOutlined />} color="green" style={TAG_STYLE}>
                      Оригинал
                    </Tag>
                  )}
                  {item.source && (
                    <Tag color="purple" style={TAG_STYLE}>
                      {item.source}
                    </Tag>
                  )}
                </Space>
                <div style={{ marginTop: 8, color: '#999', fontSize: '12px' }}>
                  <ClockCircleOutlined /> {getTimeAgoString(item.publishedAt)}
                </div>
              </div>
            }
          />
        </div>
      </Card>
    </Col>
  );
};

export default NewsCard;
