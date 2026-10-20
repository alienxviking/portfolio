import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Field from '@/components/Field';
import SmoothScroll from '@/components/SmoothScroll';
import TopBar from '@/components/TopBar';
import Dock from '@/components/Dock';
import { SITE } from '@/lib/data';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

const description = 'Systems + AI engineer in Bengaluru. Rust and C++ trading infrastructure, AI tools that show their evidence, and the backends they run on. Open to contract work.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Snehangshu Roy · Systems + AI engineer', template: '%s · Snehangshu Roy' },
  description,
  openGraph: { type: 'website', url: SITE.url, siteName: 'Snehangshu Roy', title: 'Snehangshu Roy · Systems + AI engineer', description },
  twitter: { card: 'summary_large_image', title: 'Snehangshu Roy · Systems + AI engineer', description, creator: '@SnehangshuRoy15' },
  authors: [{ name: 'Snehangshu Roy', url: SITE.github }],
};

export const viewport: Viewport = { themeColor: '#08080a', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <Field />
        <SmoothScroll />
        <TopBar />
        {children}
        <Dock />
      </body>
    </html>
  );
}
