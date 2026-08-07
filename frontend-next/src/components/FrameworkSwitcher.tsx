import React from 'react';
import { useTheme } from '@mui/material';
interface Props {
  current: 'react' | 'nestjs' | 'next' | 'vue';
}

const frameworks = {
  react: { label: '⚛️ React SPA', url: 'https://short-news.ru' },
  vue: { label: '🟢 Vue SPA', url: 'https://vue.short-news.ru' },
  next: { label: '🔵 Next.js', url: 'https://next.short-news.ru' },
  nuxt: { label: '🟣 Nuxt', url: 'https://nuxt.short-news.ru' },
};

export default function FrameworkSwitcher({ current }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <select
      value={current}
      onChange={(e) => {
        const value = e.target.value as keyof typeof frameworks;
        if (value !== current) window.location.href = frameworks[value].url;
      }}
      aria-label="Выбор фреймворка"
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        border: '1px solid #6c5ce7',
        background: 'inherit',
        color: 'inherit',
        fontSize: 13,
        cursor: 'pointer',
        outline: 'none',
        fontFamily: 'inherit',
      }}
    >
      {Object.entries(frameworks).map(([key, { label }]) => (
        <option
          key={key}
          value={key}
          style={{
            background: isDark ? '#1e1e1e' : '#fff',
            color: isDark ? '#fff' : '#1e1e1e',
          }}
        >
          {label}
        </option>
      ))}
    </select>
  );
}
