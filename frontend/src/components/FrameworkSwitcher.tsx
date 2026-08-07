import React from 'react';
import { theme as antTheme } from 'antd';

interface FrameworkSwitcherProps {
  current: 'react' | 'nestjs' | 'nuxt' | 'vue';
}

const frameworks = {
  react: { label: '⚛️ React SPA', url: 'https://short-news.ru' },
  vue: { label: '🟢 Vue SPA', url: 'https://vue.short-news.ru' },
  next: { label: '🔵 Next.js', url: 'https://next.short-news.ru' },
  nuxt: { label: '🟣 Nuxt', url: 'https://nuxt.short-news.ru' },
};

const FrameworkSwitcher: React.FC<FrameworkSwitcherProps> = ({ current }) => {
  const { token } = antTheme.useToken();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as keyof typeof frameworks;
    if (value !== current && frameworks[value].url !== '#') {
      window.location.href = frameworks[value].url;
    }
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      aria-label="Выбор фреймворка"
      style={{
        padding: '6px 12px',
        borderRadius: token.borderRadius,
        border: `1px solid ${token.colorPrimary}`,
        background: token.colorBgContainer,
        color: token.colorText,
        fontSize: 13,
        cursor: 'pointer',
        outline: 'none',
        fontFamily: token.fontFamily,
        transition: 'all 0.2s ease',
        appearance: 'auto',
      }}
    >
      {Object.entries(frameworks).map(([key, { label }]) => (
        <option
          key={key}
          value={key}
          style={{
            background: token.colorBgContainer,
            color: token.colorText,
          }}
        >
          {label}
        </option>
      ))}
    </select>
  );
};

export default FrameworkSwitcher;
