const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/backend'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  externals: {
    // Mark Node.js built-in modules as external to prevent bundling issues
    'crypto': 'commonjs crypto',
    'fs': 'commonjs fs',
    'path': 'commonjs path',
    'http': 'commonjs http',
    'https': 'commonjs https',
    'stream': 'commonjs stream',
    'util': 'commonjs util',
    'url': 'commonjs url',
    'zlib': 'commonjs zlib',
    'buffer': 'commonjs buffer',
    'events': 'commonjs events',
    'net': 'commonjs net',
    'tls': 'commonjs tls',
    'os': 'commonjs os',
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMaps: true,
    }),
  ],
};
