/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
            {
                protocol: "https",
                hostname: "cdn.discordapp.com",
                pathname: "/**",
            },
        ],
    },
    experimental: {
        serverActions: {
        bodySizeLimit: '10mb', // or '50mb' depending on your needs
        },
    },
};

export default nextConfig;
