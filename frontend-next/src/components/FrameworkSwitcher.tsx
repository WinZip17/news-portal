import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';

interface Props {
  current: 'react' | 'next' | 'nuxt' | 'vue';
}

const frameworks = {
  react: { label: '⚛️ React SPA', url: 'https://short-news.ru' },
  vue: { label: '🟢 Vue SPA', url: 'https://vue.short-news.ru' },
  next: { label: '🔵 Next.js', url: 'https://next.short-news.ru' },
  nuxt: { label: '🟣 Nuxt', url: 'https://nuxt.short-news.ru' },
} as const;

type FrameworkKey = keyof typeof frameworks;

export default function FrameworkSwitcher({ current }: Props) {
  const handleChange = (event: SelectChangeEvent<FrameworkKey>) => {
    const value = event.target.value as FrameworkKey;
    if (value !== current) {
      window.location.href = frameworks[value].url;
    }
  };

  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <Select<FrameworkKey>
        value={current}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'Выбор фреймворка' }}
      >
        {(Object.entries(frameworks) as [FrameworkKey, (typeof frameworks)[FrameworkKey]][]).map(
          ([key, { label }]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ),
        )}
      </Select>
    </FormControl>
  );
}
