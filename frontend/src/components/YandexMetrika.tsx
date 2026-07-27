import { useEffect } from 'react';

const YandexMetrika: React.FC<{ counterId: number }> = ({ counterId }) => {
  useEffect(() => {
    if (!import.meta.env.DEV) {
      const script = document.createElement('script');
      script.src = `https://mc.yandex.ru/metrika/tag.js?id=${counterId}`;
      script.async = true;
      document.head.appendChild(script);
      const initScript = document.createElement('script');
      initScript.innerHTML = `
        ym(${counterId}, 'init', {
          ssr: true,
          webvisor: true,
          clickmap: true,
          ecommerce: "dataLayer",
          referrer: document.referrer,
          url: location.href,
          accurateTrackBounce: true,
          trackLinks: true,
          host: "mc.yandex.ru"
        });
      `;
      document.head.appendChild(initScript);
    }
  }, [counterId]);

  return null;
};

export default YandexMetrika;
