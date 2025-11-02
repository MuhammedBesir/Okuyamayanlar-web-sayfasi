import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },

    typescript: {
        ignoreBuildErrors: false,
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },

    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },

    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*'
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, PUT, DELETE, OPTIONS'
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-Requested-With, Content-Type, Accept, Authorization, rsc, next-router-state-tree, next-url, next-router-prefetch, next-router-segment-prefetch'
                    },
                    {
                        key: 'Access-Control-Allow-Credentials',
                        value: 'true'
                    }
                ],
            },
        ];
    },    webpack: (config) => {
        // Harden path aliasing for Vercel/Linux builds (case-sensitive FS)
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': path.join(__dirname),
            '@/components': path.join(__dirname, 'components'),
            '@/lib': path.join(__dirname, 'lib'),
            '@/app': path.join(__dirname, 'app'),
        };
        // Ensure TS/TSX are resolvable explicitly
        if (Array.isArray(config.resolve.extensions)) {
            for (const ext of ['.ts', '.tsx']) {
                if (!config.resolve.extensions.includes(ext)) {
                    config.resolve.extensions.push(ext);
                }
            }
        }
        return config;
    },
};

export default nextConfig;
