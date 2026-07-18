import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const { Text, Title } = Typography;

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const onFinish = async (values: LoginForm) => {
    try {
      setLoginError(null);
      await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });
      navigate('/');
    } catch (err: any) {
      setLoginError(err.message || 'Ошибка входа');
    }
  };

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        Вход в аккаунт
      </Title>

      {(loginError || error) && (
        <Alert
          message={loginError || error}
          type="error"
          closable
          onClose={() => {
            setLoginError(null);
            clearError();
          }}
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
        initialValues={{ rememberMe: true }}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Пожалуйста, введите email' },
            { type: 'email', message: 'Введите корректный email' },
          ]}
        >
          <Input
            prefix={<UserOutlined/>}
            placeholder="Email"
            autoFocus
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Пожалуйста, введите пароль' },
            { min: 6, message: 'Пароль должен быть минимум 6 символов' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined/>}
            placeholder="Пароль"
          />
        </Form.Item>

        <Form.Item>
          <Form.Item name="rememberMe" valuePropName="checked" noStyle>
            <Checkbox>Запомнить меня</Checkbox>
          </Form.Item>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
          >
            Войти
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Space direction="vertical" size="small">
          <Text>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </Text>
          <Link to="/forgot-password">Забыли пароль?</Link>
        </Space>
      </div>
    </div>
  );
};

export default Login;