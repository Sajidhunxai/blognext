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
  // Add headers for better caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
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

