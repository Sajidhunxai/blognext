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
    // Enable image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable compression
  compress: true,
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
  // Configure SWC to target modern browsers and reduce polyfills
  swcMinify: true,
  // Optimize CSS
  optimizeFonts: true,
  // Webpack configuration to reduce polyfills
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Reduce polyfills for modern browsers
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Exclude unnecessary polyfills for modern browsers
      // These features are natively supported in browsers we target
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

