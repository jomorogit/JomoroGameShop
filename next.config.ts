/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      // 1. Для аватарок пользователей (Google) 👤
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '**',
      },
      // 2. ДЛЯ ТВОИХ КАРТИНОК ИГР (Cloudinary) 📸
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // Разрешаем все пути внутри Cloudinary
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Увеличили лимит для загрузки тяжелых файлов 📤
    },
  },
};

export default nextConfig;