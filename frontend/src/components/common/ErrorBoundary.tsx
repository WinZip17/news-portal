import React from 'react';
import { Button, Result } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
                                                       error,
                                                       resetErrorBoundary
                                                     }) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <Result
        status="error"
        title="Что-то пошло не так"
        subTitle="Произошла непредвиденная ошибка в приложении"
        extra={[
          <Button
            key="retry"
            type="primary"
            icon={<ReloadOutlined/>}
            onClick={resetErrorBoundary}
          >
            Попробовать снова
          </Button>,
          <Button
            key="reload"
            icon={<ReloadOutlined/>}
            onClick={handleReload}
          >
            Обновить страницу
          </Button>,
          <Button
            key="home"
            icon={<HomeOutlined/>}
            onClick={handleGoHome}
          >
            На главную
          </Button>,
        ]}
      >
        {import.meta.env.DEV && (
          <div style={{ maxWidth: 600, margin: '20px auto', textAlign: 'left' }}>
            <h4>Техническая информация (только для разработки):</h4>
            <p style={{ color: 'red' }}>{error.message}</p>
            {error.stack && (
              <pre style={{
                fontSize: '11px',
                maxHeight: 200,
                overflow: 'auto',
                padding: '8px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
              }}>
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </Result>
    </div>
  );
};

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, { hasError: boolean; error: Error | null }> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error | null } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Здесь можно отправить ошибку в сервис мониторинга
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Очищаем кэш при восстановлении
    sessionStorage.clear();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;