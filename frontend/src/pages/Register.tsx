import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography, Space, Steps } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const onFinish = async (values: RegisterForm) => {
    try {
      setRegisterError(null);
      await registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      navigate('/');
    } catch (err: any) {
      setRegisterError(err.message || 'Ошибка регистрации');
    }
  };

  const nextStep = () => {
    form.validateFields(['email', 'password', 'confirmPassword'])
      .then(() => setCurrentStep(1))
      .catch(() => {
      });
  };

  const prevStep = () => {
    setCurrentStep(0);
  };

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        Регистрация
      </Title>

      <Steps
        current={currentStep}
        items={[
          { title: 'Аккаунт' },
          { title: 'Профиль' },
        ]}
        style={{ marginBottom: 32 }}
      />

      {(registerError || error) && (
        <Alert
          message={registerError || error}
          type="error"
          closable
          onClose={() => {
            setRegisterError(null);
            clearError();
          }}
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
        initialValues={{ step: 0 }}
      >
        {currentStep === 0 && (
          <>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Пожалуйста, введите email' },
                { type: 'email', message: 'Введите корректный email' },
              ]}
            >
              <Input prefix={<MailOutlined/>} placeholder="Email"/>
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Пожалуйста, введите пароль' },
                { min: 8, message: 'Пароль должен быть минимум 8 символов' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Пароль должен содержать заглавные, строчные буквы и цифры',
                },
              ]}
            >
              <Input.Password prefix={<LockOutlined/>} placeholder="Пароль"/>
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Подтвердите пароль' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Пароли не совпадают'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined/>} placeholder="Подтвердите пароль"/>
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={nextStep} block>
                Далее
              </Button>
            </Form.Item>
          </>
        )}

        {currentStep === 1 && (
          <>
            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'Пожалуйста, введите имя пользователя' },
                { min: 3, message: 'Минимум 3 символа' },
                { max: 30, message: 'Максимум 30 символов' },
              ]}
            >
              <Input prefix={<UserOutlined/>} placeholder="Имя пользователя"/>
            </Form.Item>

            <Form.Item name="firstName">
              <Input placeholder="Имя (необязательно)"/>
            </Form.Item>

            <Form.Item name="lastName">
              <Input placeholder="Фамилия (необязательно)"/>
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%' }} direction="vertical">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  block
                >
                  Зарегистрироваться
                </Button>
                <Button onClick={prevStep} block>
                  Назад
                </Button>
              </Space>
            </Form.Item>
          </>
        )}
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Text>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </Text>
      </div>
    </div>
  );
};

export default Register;