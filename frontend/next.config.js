/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure static exports are handled correctly
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig