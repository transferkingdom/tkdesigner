/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://sdk.picsart.io'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-site'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' https://sdk.picsart.io; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.picsart.io; style-src 'self' 'unsafe-inline' https://sdk.picsart.io; img-src 'self' data: https://*.picsart.io; connect-src 'self' https://*.picsart.io;"
          }
        ]
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.picsart.io/:path*'
      },
      {
        source: '/sdk/:path*',
        destination: 'https://sdk.picsart.io/:path*'
      },
      {
        source: '/cdn/:path*',
        destination: 'https://cdn.picsart.io/:path*'
      },
      {
        source: '/auth/:path*',
        destination: 'https://picsart.cloudflareaccess.com/:path*'
      }
    ];
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

module.exports = nextConfig; 