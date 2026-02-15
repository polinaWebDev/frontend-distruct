export const getSiteUrl = () =>
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'https://distruct.info';

export const buildSocialMetadata = (
    path: string,
    title: string,
    description: string,
    type: 'website' | 'article' = 'website'
) => {
    return {
        openGraph: {
            title,
            description,
            type,
            url: `${getSiteUrl()}${path}`,
            images: [
                {
                    url: '/opengraph-image',
                    width: 1200,
                    height: 630,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image' as const,
            title,
            description,
            images: ['/opengraph-image'],
        },
    };
};
