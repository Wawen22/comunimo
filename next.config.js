/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // Ignora errori ESLint durante la build di produzione
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ignora errori TypeScript durante la build di produzione
    ignoreBuildErrors: false,
  },
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
};

module.exports = nextConfig;

