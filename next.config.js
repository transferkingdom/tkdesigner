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
            value: 'X-Requested-With, Content-Type, Authorization, Accept'
          },
          {
            key: 'Accept',
            value: 'application/json'
          },
          {
            key: 'User-Agent',
            value: 'TKDesigner/1.0'
          }
        ]
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sdk/:path*',
        destination: 'https://sdk.picsart.io/:path*'
      }
    ];
  }
};

module.exports = nextConfig; 