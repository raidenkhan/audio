/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://audio-2-qp7v.onrender.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
