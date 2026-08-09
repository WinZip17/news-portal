import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import { Button, Result } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
  const stack = error instanceof Error ? error.stack : undefined;

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Result
        status="error"
        title="Что-то пошло не так"
        subTitle="Произошла непредвиденная ошибка в приложении"
        extra={[
          <Button key="retry" type="primary" icon={<ReloadOutlined />} onClick={resetErrorBoundary}>
            Попробовать снова
          </Button>,
          <Button key="reload" icon={<ReloadOutlined />} onClick={handleReload}>
            Обновить страницу
          </Button>,
          <Button key="home" icon={<HomeOutlined />} onClick={handleGoHome}>
            На главную
          </Button>,
        ]}
      >
        {import.meta.env.DEV && (
          <div style={{ maxWidth: 600, margin: '20px auto', textAlign: 'left' }}>
            <h4>Техническая информация (только для разработки):</h4>
            <p style={{ color: 'red' }}>{message}</p>
            {stack && (
              <pre
                style={{
                  fontSize: '11px',
                  maxHeight: 200,
                  overflow: 'auto',
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                }}
              >
                {stack}
              </pre>
            )}
          </div>
        )}
      </Result>
    </div>
  );
};

const AppErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handleReset = () => {
    sessionStorage.clear();
  };

  const handleError = (error: Error, info: React.ErrorInfo) => {
    console.error('Error caught by boundary:', error, info);
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError} onReset={handleReset}>
      {children}
    </ErrorBoundary>
  );
};

export default AppErrorBoundary;
