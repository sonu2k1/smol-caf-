import type { Metadata } from 'next';
import { Inter, EB_Garamond, Noto_Sans_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import NavigationHeader from '@/components/NavigationHeader';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
  display: 'swap',
});

const notoMono = Noto_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-noto-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'smol café — pos & ops system',
  description: 'warm, literary mobile web pos for smol café (rishikesh)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${ebGaramond.variable} ${notoMono.variable}`}>
      <body className="bg-brand-creme text-brand-espresso dark:bg-brand-espresso dark:text-brand-creme min-h-screen selection:bg-brand-cherry selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <div className="max-w-md mx-auto min-h-screen shadow-2xl relative flex flex-col bg-brand-creme dark:bg-brand-espresso border-x border-brand-biscuit/20 dark:border-brand-espresso/50">
              <NavigationHeader />
              <main className="flex-1 pb-16">{children}</main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
