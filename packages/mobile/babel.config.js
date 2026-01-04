const path = require('path');

module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./src'],
                    extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                    alias: {
                        '@adminvault/shared-services': path.resolve(__dirname, '../../packages/libs/shared-services/src/index.ts'),
                        '@adminvault/shared-models': path.resolve(__dirname, '../../packages/libs/shared-models/src/index.ts'),
                        '@adminvault/backend-utils': path.resolve(__dirname, '../../packages/libs/backend-utils/src/index.ts'),
                    },
                },
            ],
            'react-native-reanimated/plugin',
        ],
    };
};
