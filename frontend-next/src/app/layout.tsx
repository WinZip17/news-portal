import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: {
    default: 'Short News — Короткие новости без манипуляций',
    template: '%s | Short News',
  },
  description: 'Быстрые и короткие новости с AI-рерайтом. Минимум слов, максимум фактов.',
  openGraph: {
    title: 'Short News — Короткие новости без манипуляций',
    description: 'Суть новости за 30 секунд. AI-рерайт из проверенных источников.',
    type: 'website',
    locale: 'ru_RU',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
