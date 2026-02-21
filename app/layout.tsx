import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
// import './globals.css';
import localFont from 'next/font/local';
import { NextIntlClientProvider } from 'next-intl';
import { QueryClientProvider } from '@/lib/providers/QueryClient.provider';
import { getSiteUrl } from '@/lib/seo';
import { WebVitals } from '@/app/_components/WebVitals';

const montserrat = Montserrat({
    variable: '--font-montserrat',
    subsets: ['latin'],
});

const thicker = localFont({
    src: '../public/fonts/Thicker-Variable-Roman-TRIAL.woff2',
    variable: '--font-thicker',
});

const siteUrl = getSiteUrl();
const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === 'production';

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: 'Distruct',
    description: 'Distruct — игровые челленджи, новости, карты и рейтинги.',
    robots: isProduction
        ? { index: true, follow: true }
        : { index: false, follow: false, noarchive: true, nocache: true },
    openGraph: {
        title: 'Distruct',
        description: 'Distruct — игровые челленджи, новости, карты и рейтинги.',
        type: 'website',
        url: siteUrl,
        images: [
            {
                url: '/opengraph-image',
                width: 1200,
                height: 630,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Distruct',
        description: 'Distruct — игровые челленджи, новости, карты и рейтинги.',
        images: ['/opengraph-image'],
    },
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
                    <WebVitals />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
