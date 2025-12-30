import { ImageInfo } from '@/lib/types';

export const exampleImage: ImageInfo = {
  id: 'cmqlgj',
  imageUrl:
    'https://o7f2rjllxxdvs2xh.public.blob.vercel-storage.com/example.png',
  proxyUrl:
    '/api/image-proxy?url=https%3A%2F%2Fo7f2rjllxxdvs2xh.public.blob.vercel-storage.com%2Fexample.png',
  isAnalyzing: false,
  analysis: {
    description:
      'A fluffy golden dog wearing a star accessory on its head lounges on a colorful polka-dot cushion, holding a purple mug with paw prints filled with marshmallows. The background features a whimsical night sky with stars, clouds, a rainbow, and plants. Nearby, there is an open book, smartphone, plate of heart-shaped cookies, and a small lamp, creating a cozy and playful atmosphere.',
    keywords: [
      'cute dog',
      'golden fur',
      'purple mug',
      'rainbow',
      'night sky',
      'polka-dot cushion',
      'heart-shaped cookies',
      'open book',
      'smartphone',
      'colorful',
    ],
    searchTerm: 'cute dog on colorful cushion with cozy accessories',
  },
};
