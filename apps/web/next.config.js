/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@groupfit/shared', 'tamagui', '@tamagui/core', '@tamagui/config'],
};

module.exports = nextConfig;
