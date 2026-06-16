import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/lib/query-provider';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'PayU - USDT TRC20 虚拟商品商城',
  description: '安全、快速、自动到账的 USDT TRC20 虚拟商品商城'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
