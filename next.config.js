/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
     
    ],
    // Optimize images for better LCP
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Target modern browsers to reduce polyfills
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimize for modern browsers
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Configure SWC to target modern browsers
  swcMinify: true,
};

module.exports = nextConfig;

