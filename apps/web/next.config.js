const path = require('path');

const monorepoRoot = path.resolve(__dirname, '../..');
const sharedSrc = path.join(monorepoRoot, 'shared/src');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@groupfit/shared', 'tamagui', '@tamagui/core', '@tamagui/config'],
  webpack: (config, { dev }) => {
    // In dev: resolve @groupfit/shared to source so edits in shared show up without build:shared
    const alias = {
      ...config.resolve.alias,
      'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
    };
    if (dev) {
      alias['@groupfit/shared'] = sharedSrc;
      alias['@groupfit/shared/components'] = path.join(sharedSrc, 'components');
      alias['@groupfit/shared/utils'] = path.join(sharedSrc, 'utils');
      alias['@groupfit/shared/i18n'] = path.join(sharedSrc, 'i18n');
      alias['@groupfit/shared/api'] = path.join(sharedSrc, 'api');
      alias['@groupfit/shared/timezone'] = path.join(sharedSrc, 'timezone');
      alias['@groupfit/shared/theme'] = path.join(sharedSrc, 'theme');
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules/**', '**/.git/**'],
        poll: 2000,
      };
    }
    config.resolve.alias = alias;
    return config;
  },
};

module.exports = nextConfig;
