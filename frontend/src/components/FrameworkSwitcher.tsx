import React from 'react';
import { Select } from 'antd';

interface FrameworkSwitcherProps {
  current: 'react' | 'next' | 'nuxt' | 'vue';
}

const frameworks = {
  react: { label: '⚛️ React SPA', url: 'https://short-news.ru' },
  vue: { label: '🟢 Vue SPA', url: 'https://vue.short-news.ru' },
  next: { label: '🔵 Next.js', url: 'https://next.short-news.ru' },
  nuxt: { label: '🟣 Nuxt', url: 'https://nuxt.short-news.ru' },
} as const;

type FrameworkKey = keyof typeof frameworks;

const options = (Object.entries(frameworks) as [FrameworkKey, (typeof frameworks)[FrameworkKey]][]).map(([value, { label }]) => ({ value, label }));

const FrameworkSwitcher: React.FC<FrameworkSwitcherProps> = ({ current }) => {
  const handleChange = (value: FrameworkKey) => {
    if (value !== current) {
      window.location.href = frameworks[value].url;
    }
  };

  return (
    <Select<FrameworkKey>
      value={current}
      onChange={handleChange}
      options={options}
      size="small"
      aria-label="Выбор фреймворка"
      style={{ minWidth: 150 }}
      popupMatchSelectWidth={false}
    />
  );
};

export default FrameworkSwitcher;
