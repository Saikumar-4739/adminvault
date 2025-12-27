//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  transpilePackages: [
    '@adminvault/shared-services',
    '@adminvault/shared-models',
    '@adminvault/backend-utils',
  ],

  // Performance Optimizations
  swcMinify: true, // Use SWC for faster minification
  compress: true, // Enable gzip compression
  productionBrowserSourceMaps: false, // Disable source maps in production

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Modularize imports for better tree-shaking
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize chunk splitting
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Recharts vendor chunk
          recharts: {
            test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
            name: 'recharts',
            priority: 10,
            reuseExistingChunk: true,
          },
          // Lucide icons chunk
          lucide: {
            test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
            name: 'lucide-icons',
            priority: 9,
            reuseExistingChunk: true,
          },
          // Common vendor chunk
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 8,
            reuseExistingChunk: true,
          },
          // Common code chunk
          common: {
            minChunks: 2,
            priority: 7,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
