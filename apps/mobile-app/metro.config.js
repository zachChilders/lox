const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

// Find the monorepo root (two levels up from this file)
const monorepoRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Add the monorepo root to watch folders so Metro can find node_modules there
config.watchFolders = [monorepoRoot];

// Update resolver to look in monorepo root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Enable symlink support for pnpm (required for native modules)
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
