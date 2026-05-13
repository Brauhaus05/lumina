import type { Metadata } from 'next';
import './globals.css';
import { Geist, Bebas_Neue, Anton } from 'next/font/google';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' });
const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton' });

export const metadata: Metadata = {
  title: 'Lumina Admin',
  description: 'Headless multi-tenant blogging engine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable, bebasNeue.variable, anton.variable)}>
      <body>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
