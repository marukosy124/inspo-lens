import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/layout/header';
import { AuthProvider } from '@/lib/context/auth-context';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ModalProvider } from '@/components/providers/modal-provider';
import { CompleteUser } from '@/lib/types';
import { officialUser } from '@/lib/constants';

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
    'One image, endless ideas. Transform any visual into keywords, color palettes, and creative direction — instantly.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let completeUser: CompleteUser | null = null;

  //  make sure initial user for auth context has profile info
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url, avatar_color')
      .eq('id', user.id)
      .single();

    completeUser = profile
      ? { ...user, ...profile, is_official: false }
      : {
          ...user,
          username: null,
          avatar_url: null,
          avatar_color: undefined,
          is_official: false,
        };
  } else {
    completeUser = officialUser;
  }

  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2811046510872625"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 antialiased`}
      >
        <AuthProvider initialUser={completeUser}>
          <Header />
          <main className="container mx-auto min-h-screen max-w-7xl px-6">
            {children}
          </main>
          <Footer />
          <Toaster />
          <ModalProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
