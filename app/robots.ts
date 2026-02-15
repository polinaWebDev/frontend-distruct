import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'https://distruct.info';

export default function robots(): MetadataRoute.Robots {
    const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === 'production';
    return {
        rules: [
            {
                userAgent: '*',
                allow: isProduction ? '/' : undefined,
                disallow: isProduction
                    ? ['/admin', '/dashboard', '/profile', '/api', '/secret']
                    : ['/'],
            },
        ],
        sitemap: isProduction ? `${siteUrl}/sitemap.xml` : undefined,
    };
}
