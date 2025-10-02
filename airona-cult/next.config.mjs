/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    experimental: {
        serverActions: {
        bodySizeLimit: '10mb', // or '50mb' depending on your needs
        },
    },
};

export default nextConfig;
