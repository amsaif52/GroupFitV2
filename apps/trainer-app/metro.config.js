const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const sharedSrc = path.join(monorepoRoot, 'shared/src');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Resolve @groupfit/shared to source so we don't need to run build:shared on every change
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@groupfit/shared': sharedSrc,
};

config.resolver.unstable_conditionNames = ['react-native', 'require', 'import'];
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
