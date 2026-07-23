import React from 'react';

interface FrameworkSwitcherProps {
  current: 'react' | 'nestjs' | 'nuxt';
}

const frameworks = {
  react: { label: '⚛️ React SPA', url: 'https://short-news.ru' },
  nestjs: { label: '🟢 NestJS SSR + React', url: 'https://nest.short-news.ru' },
  // nuxt: { label: '🟣 Nuxt', url: '#' },
};

const FrameworkSwitcher: React.FC<FrameworkSwitcherProps> = ({ current }) => {
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
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        border: '1px solid #6c5ce7',
        background: '#1a1a2e',
        color: '#fff',
        fontSize: 13,
        cursor: 'pointer',
        outline: 'none',
        fontFamily: 'inherit',
      }}
    >
      {Object.entries(frameworks).map(([key, { label }]) => (
        <option key={key} value={key} disabled={key === 'nuxt'}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default FrameworkSwitcher;
