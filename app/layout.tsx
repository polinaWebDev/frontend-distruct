import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
// import './globals.css';
import localFont from 'next/font/local';
import { NextIntlClientProvider } from 'next-intl';
import { QueryClientProvider } from '@/lib/providers/QueryClient.provider';

const montserrat = Montserrat({
    variable: '--font-montserrat',
    subsets: ['latin'],
});

const thicker = localFont({
    src: '../public/fonts/Thicker-Variable-Roman-TRIAL.woff2',
    variable: '--font-thicker',
});

export const metadata: Metadata = {
    title: 'Distruct',
    description: 'Distruct web app',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${montserrat.variable} ${thicker.variable} antialiased dark`}>
                <NextIntlClientProvider>
                    <QueryClientProvider>{children}</QueryClientProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
