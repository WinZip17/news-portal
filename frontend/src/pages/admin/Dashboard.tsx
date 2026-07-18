import React, { useEffect, useState } from 'react';
import { Tabs, Card, Row, Col, Statistic, Table, Button, Tag, Space, Modal, message, Select } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ReadOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    RobotOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { newsService } from '../../services/newsService';
import { News, NewsStatus } from '../../types/news';
import type { ColumnsType } from 'antd/es/table';
import UsersManagement from "./UsersManagement.tsx";

const { TabPane } = Tabs;

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        loadNews();
    }, [activeTab]);

    const loadNews = async () => {
        setLoading(true);
        try {
            let status = activeTab === 'all' ? undefined : activeTab;
            const response = await newsService.getNews({
                status: status as NewsStatus,
                limit: 50,
                sortBy: 'createdAt',
                sortOrder: 'DESC',
            });
            setNews(response.data);
        } catch (error) {
            message.error('Ошибка загрузки новостей');
        }
        setLoading(false);
    };

    const handleModerate = async (id: string, status: NewsStatus, comment?: string) => {
        try {
            await newsService.moderateNews(id, status);
            message.success(`Новость ${status === NewsStatus.PUBLISHED ? 'опубликована' : 'отклонена'}`);
            loadNews();
        } catch (error) {
            message.error('Ошибка модерации');
        }
    };

    const columns: ColumnsType<News> = [
        {
            title: 'Заголовок',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (text, record) => (
                <a onClick={() => navigate(`/news/${record.id}`)}>{text}</a>
            ),
        },
        {
            title: 'Категория',
            dataIndex: 'category',
            key: 'category',
            width: 130,
            render: (cat) => <Tag>{cat}</Tag>,
        },
        {
            title: 'Тип',
            dataIndex: 'isAiGenerated',
            key: 'type',
            width: 120,
            render: (ai) => ai ? <Tag icon={<RobotOutlined />} color="blue">AI</Tag> : <Tag color="green">Оригинал</Tag>,
        },
        {
            title: 'Источник',
            dataIndex: 'source',
            key: 'source',
            width: 120,
            ellipsis: true,
        },
        {
            title: 'Дата',
            dataIndex: 'createdAt',
            key: 'date',
            width: 120,
            render: (date) => new Date(date).toLocaleDateString('ru-RU'),
        },
        {
            title: 'Просмотры',
            dataIndex: 'views',
            key: 'views',
            width: 80,
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleModerate(record.id, NewsStatus.PUBLISHED)}
                    >
                        Опубликовать
                    </Button>
                    <Button
                        danger
                        size="small"
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleModerate(record.id, NewsStatus.REJECTED)}
                    >
                        Отклонить
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h1>Админ-панель</h1>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab={<span><ClockCircleOutlined /> На модерации</span>} key="pending" />
                <TabPane tab={<span><CheckCircleOutlined /> Опубликованные</span>} key="published" />
                <TabPane tab={<span><CloseCircleOutlined /> Отклоненные</span>} key="rejected" />
                <TabPane tab={<span><ReadOutlined /> Все</span>} key="all" />
                <TabPane tab="Пользователи" key="users">
                    <UsersManagement />
                </TabPane>
            </Tabs>
            <Table
                columns={columns}
                dataSource={news}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1000 }}
            />
        </div>
    );
};

export default AdminDashboard;