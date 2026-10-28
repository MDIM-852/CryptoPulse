import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider';
import { AuthProvider } from '@/context/auth-context';
import { TradeProvider } from '@/context/trade-context';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'CryptoPulse — Real-Time Cryptocurrency Portfolio & Terminal',
  description: 'Production-ready crypto portfolio tracker with real-time Binance WebSocket price feeds, paper trading, risk pulse, and analytics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AuthProvider>
              <TradeProvider>
                {children}
                <Toaster position="top-right" richColors closeButton />
              </TradeProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
