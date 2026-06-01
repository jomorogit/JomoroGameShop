import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*', // Разрешаем всем поисковикам
      allow: '/',     // Разрешаем индексировать главную и игры
      disallow: [     // Запреты для SEO
        '/cart',      
        '/api/',      
        '/library',   
        '/account',
        '/wishlist'
      ],
    },
    // Если у тебя будет sitemap.xml, укажи его тут (опционально)
    // sitemap: 'https://твой-домен.com/sitemap.xml', 
  };
}