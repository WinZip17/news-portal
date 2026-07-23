import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import { authService } from '../services/auth.service';
import axios from 'axios';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(values.email, values.password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      window.location.href = '/';
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Ошибка входа');
      } else {
        setError('Ошибка входа');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <Button
        icon={<HomeOutlined />}
        type="text"
        onClick={() => (window.location.href = '/')}
      >
        На главную
      </Button>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        Вход в аккаунт
      </Title>
      {error && (
        <Alert
          title={error}
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 24 }}
        />
      )}
      <Form onFinish={onFinish} size="large">
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Некорректный email' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Введите пароль' },
            { min: 6, message: 'Минимум 6 символов' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Войти
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center' }}>
        <Text>
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </Text>
      </div>
    </div>
  );
};

export default Login;
