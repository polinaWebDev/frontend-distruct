import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isLocalEnv = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local';

const nextConfig: NextConfig = {
    /* config options here */
    productionBrowserSourceMaps: true,
    experimental: {
        serverSourceMaps: true,
    },
    images: {
        unoptimized: isLocalEnv,
        remotePatterns: [
            new URL('https://picsum.photos/**'),
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3281',
                pathname: '/api/public/uploads/**',
            },
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
