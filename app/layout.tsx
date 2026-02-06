import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { RegistrationNoticeModal } from '@/components/layout/RegistrationNoticeModal';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ComUniMo - Comitato Unitario Modena',
  description: 'Sistema di gestione per il Comitato Unitario Modena',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <ReactQueryProvider>
          <RegistrationNoticeModal />
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
