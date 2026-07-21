import React from 'react';
import { Helmet } from 'react-helmet-async';

interface NewsSEOProps {
  title: string;
  summary?: string;
  imageUrl?: string;
  publishedAt?: string;
  category?: string;
  tags?: string[];
  author?: string;
  url: string;
}

const NewsSEO: React.FC<NewsSEOProps> = ({ title, summary, imageUrl, publishedAt, category, tags, author, url }) => {
  const siteName = 'News Portal';
  const fullTitle = `${title} | ${siteName}`;
  const description = summary?.substring(0, 160) || 'Читайте новость на News Portal';
  const image = imageUrl || 'https://news-portal.ru/og-image.png';
  const publishedTime = publishedAt ? new Date(publishedAt).toISOString() : undefined;

  return (
    <Helmet>
      {/* Базовые мета-теги */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={tags?.join(', ') || category || 'новости'} />
      <meta name="author" content={author || siteName} />
      <link rel="canonical" href={url} />

      {/* Open Graph (Facebook, VK, Telegram) */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="ru_RU" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article специфичные теги */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {category && <meta property="article:section" content={category} />}
      {tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Структурированные данные Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: title,
          description: description,
          image: image,
          datePublished: publishedTime,
          author: {
            '@type': 'Organization',
            name: author || siteName,
          },
          publisher: {
            '@type': 'Organization',
            name: siteName,
            logo: {
              '@type': 'ImageObject',
              url: 'https://news-portal.ru/favicon.svg',
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
          },
        })}
      </script>
    </Helmet>
  );
};

export default NewsSEO;
