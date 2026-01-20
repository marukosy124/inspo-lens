import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Footer from '@/app/_components/footer';
import { ClerkProvider } from '@clerk/nextjs';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'InspoLens',
  description:
    'One image, many ideas. Turn visuals into keywords, colors, and directions you can explore.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2811046510872625"
            crossOrigin="anonymous"
          ></script>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50`}
        >
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
