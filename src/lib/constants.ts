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
    colors: [
      {
        hex: '#F4D9C5',
        percentage: 0.25097776613192807,
        rgb: {
          r: 244,
          g: 217,
          b: 197,
        },
        hsl: {
          h: 26,
          s: 68,
          l: 86,
        },
        isDark: false,
        name: 'Peach Cream',
      },
      {
        hex: '#38489F',
        percentage: 0.16749643345852622,
        rgb: {
          r: 56,
          g: 72,
          b: 159,
        },
        hsl: {
          h: 231,
          s: 48,
          l: 42,
        },
        isDark: true,
        name: 'Indigo',
      },
      {
        hex: '#E99526',
        percentage: 0.1602177773895828,
        rgb: {
          r: 233,
          g: 149,
          b: 38,
        },
        hsl: {
          h: 34,
          s: 82,
          l: 53,
        },
        isDark: false,
        name: 'Golden Orange',
      },
      {
        hex: '#C671BF',
        percentage: 0.1189914694150872,
        rgb: {
          r: 198,
          g: 113,
          b: 191,
        },
        hsl: {
          h: 305,
          s: 43,
          l: 61,
        },
        isDark: false,
        name: 'Lavender Purple',
      },
      {
        hex: '#F2AC6E',
        percentage: 0.10316281868382489,
        rgb: {
          r: 242,
          g: 172,
          b: 110,
        },
        hsl: {
          h: 28,
          s: 84,
          l: 69,
        },
        isDark: false,
        name: 'Apricot',
      },
    ],
  },
};
