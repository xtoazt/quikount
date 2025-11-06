/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('puppeteer-core');
    }
    return config;
  },
}

module.exports = nextConfig

