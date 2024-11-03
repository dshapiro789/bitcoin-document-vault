/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure static exports are handled correctly
  images: {
    unoptimized: true
  },
  output: 'standalone',
  distDir: '.next'
}

module.exports = nextConfig