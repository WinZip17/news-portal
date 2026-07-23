import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, message } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { authService } from '../services/auth.service';

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(values);
      message.success('Регистрация завершена успешно!');
      window.location.href = '/';
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Ошибка регистрации');
      } else {
        setError('Ошибка регистрации');
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
        Регистрация
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
            { type: 'email' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="username"
          rules={[
            { required: true, message: 'Введите имя пользователя' },
            { min: 3, max: 30 },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Имя пользователя" />
        </Form.Item>
        <Form.Item name="firstName">
          <Input placeholder="Имя (необязательно)" />
        </Form.Item>
        <Form.Item name="lastName">
          <Input placeholder="Фамилия (необязательно)" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Введите пароль' },
            { min: 8, message: 'Минимум 8 символов' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Заглавные, строчные буквы и цифры',
            },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Подтвердите пароль' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value)
                  return Promise.resolve();
                return Promise.reject(new Error('Пароли не совпадают'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Подтвердите пароль"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Text>
          Уже есть аккаунт? <a href="/login">Войти</a>
        </Text>
      </div>
    </div>
  );
};

export default Register;
