import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    /* config options here */
    productionBrowserSourceMaps: true,
    experimental: {
        serverSourceMaps: true,
    },
    images: {
        remotePatterns: [
            new URL('https://picsum.photos/**'),
            {
                hostname: 'loremflickr.com',
            },
            {
                hostname: 'distruct_help.dvklab.com',
            },
            {
                hostname: 'cdn.distruct.info',
            },
        ],
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
