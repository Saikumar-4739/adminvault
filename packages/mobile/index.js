// Inject Environment Variables for Shared Services
// This must be done before any imports that use the config
// @ts-ignore
if (typeof window !== 'undefined') {
    // @ts-ignore
    window._env_ = {
        APP_AVS_SERVICE_URL: 'http://192.168.1.136:3001', // Local Backend IP
    };
}

import { registerRootComponent } from 'expo';

import App from './src/app/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
