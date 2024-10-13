import React from 'react';
import { Toaster } from 'sonner';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/providers/theme-provider';
import { GeneralContextProvider } from '@/context/general-context-provider';
import { ReduxProvider } from '@/stores/ReduxProvider';
import { auth } from "@/lib/auth";
import SessionProvider from "@/providers/session-provider";
import { NextUIProvider } from '@nextui-org/react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Telamonix',
  description: 'The connected workspace where better, faster work happens.',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon.ico',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/apple-icon.jpg',
    shortcut: '/icon.jpg',
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <React.StrictMode>
          <SessionProvider session={session}>
            <ReduxProvider>
              <NextUIProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                  storageKey="telamonix-theme-2"
                >
                  <Toaster position="bottom-center" />
                  <GeneralContextProvider>
                    {children}
                  </GeneralContextProvider>
                </ThemeProvider>
              </NextUIProvider>
            </ReduxProvider>
          </SessionProvider>
        </React.StrictMode>
      </body>
    </html>
  );
}
