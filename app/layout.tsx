import type { Metadata } from 'next';
import { Inter, EB_Garamond, Noto_Sans_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import NavigationHeader from '@/components/NavigationHeader';
import CustomerBottomNav from '@/components/CustomerBottomNav';

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
  title: 'smol café — guest ordering experience & pos',
  description: 'late nights. good coffee. better conversations.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
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
            <div className="max-w-md mx-auto min-h-screen shadow-2xl relative flex flex-col bg-brand-creme dark:bg-brand-espresso border-x border-brand-biscuit/20 dark:border-brand-espressoCard">
              <NavigationHeader />
              <main className="flex-1">{children}</main>
              <CustomerBottomNav />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
