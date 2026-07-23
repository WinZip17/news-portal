import React from 'react';

interface Props {
  current: 'react' | 'nestjs' | 'next';
}

const frameworks = {
  react: { label: '⚛️ React SPA', url: 'https://short-news.ru' },
  nestjs: { label: '🟢 NestJS SSR', url: 'https://nest.short-news.ru' },
  next: { label: '🔵 Next.js', url: 'https://next.short-news.ru' },
};

export default function FrameworkSwitcher({ current }: Props) {
  return (
    <select
      value={current}
      onChange={(e) => {
        const value = e.target.value as keyof typeof frameworks;
        if (value !== current) window.location.href = frameworks[value].url;
      }}
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        border: '1px solid #6c5ce7',
        background: '#1a1a2e',
        color: '#fff',
        fontSize: 13,
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {Object.entries(frameworks).map(([key, { label }]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}
