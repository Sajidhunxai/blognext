/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    const canonicalUrl = process.env.NEXT_PUBLIC_CANONICAL_URL || 
                        process.env.NEXTAUTH_URL || 
                        process.env.NEXT_PUBLIC_SITE_URL;
    
    if (!canonicalUrl) {
      return [];
    }

    try {
      const url = new URL(canonicalUrl);
      const canonicalHost = url.hostname; 
      const canonicalOrigin = url.origin;
      const canonicalDomain = canonicalHost.replace(/^www\./, '');
      const isWww = canonicalHost.startsWith('www.');
      
      const redirects = [];

      if (isWww) {
        redirects.push({
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: canonicalDomain, 
            },
          ],
          destination: `${canonicalOrigin}/:path*`,
          permanent: true,
        });
      } 
      else {
        redirects.push({
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: `www.${canonicalDomain}`, 
            },
          ],
          destination: `${canonicalOrigin}/:path*`,
          permanent: true,
        });
      }

      return redirects;
    } catch (error) {
      console.warn('Invalid canonical URL in environment variables, skipping redirects:', error);
      return [];
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // Cache processed images for 30 days (was 60 seconds — causing cold-cache on every visit)
    minimumCacheTTL: 2592000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cloudinary images bypass /_next/image (see SmartImage.tsx), so this
    // only affects non-Cloudinary images that still go through the proxy.
    dangerouslyAllowSVG: false,
  },
  // Enable compression
  compress: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Enable Brotli/gzip negotiation hint for CDNs
          { key: 'Vary', value: 'Accept-Encoding' },
        ],
      },
      // Next.js static assets — content-hashed, safe to cache forever
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // next/image proxy responses — cache 30 days on CDN/browser
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
          { key: 'Vary', value: 'Accept' },
        ],
      },
      // Public folder static files
      {
        source: '/(.*)\\.(png|jpg|jpeg|gif|webp|avif|svg|ico|woff2|woff)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
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

