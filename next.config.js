/** @type {import('next').NextConfig} */
const nextConfig = {
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
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
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
      }
    ];
  }
};

module.exports = nextConfig; 