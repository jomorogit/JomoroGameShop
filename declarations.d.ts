declare module 'swiper/css';
declare module 'swiper/css/navigation';
declare module 'swiper/css/thumbs';
declare module 'swiper/css/free-mode';
declare module 'swiper/css/scrollbar';

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}