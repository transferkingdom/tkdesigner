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
  },
  typescript: {
    ignoreBuildErrors: true
  },
  async middleware() {
    return {
      headers: async (req) => {
        return {
          'X-Real-IP': req.headers['x-real-ip'],
          'X-Forwarded-For': req.headers['x-forwarded-for'],
          'X-Forwarded-Proto': req.headers['x-forwarded-proto'],
          'X-Forwarded-Host': req.headers['x-forwarded-host']
        };
      }
    };
  }
};

module.exports = nextConfig; 