/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('puppeteer-core');
      config.externals.push('@sparticuz/chromium');
    }
    // Ensure .js files in lib folder are handled correctly
    config.resolve.extensions.push('.js');
    return config;
  },
}

module.exports = nextConfig

