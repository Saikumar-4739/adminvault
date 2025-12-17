import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { configVariables } from './config';


let http: any;
let https: any;
if (typeof window === 'undefined') {
    http = require('http');
    https = require('https');
}

const RETRY_CODES: string[] = configVariables.APP_RETRY_CODES?.split(',') || []; // network issue code
const APP_REQ_RETRY_STATUS_CODES: string[] = configVariables.APP_REQ_RETRY_STATUS_CODES?.split(',') || [];

// Create axios instance with agents only in Node.js environment
export const AxiosInstance = axios.create(
    typeof window === 'undefined'
        ? {
            httpAgent: new http.Agent({ keepAlive: true, maxSockets: 100, maxFreeSockets: 5, freeSocketTimeout: 30000 }),
            httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 100, maxFreeSockets: 5, freeSocketTimeout: 30000 }),
        }
        : {}
);
axiosRetry(AxiosInstance, {
    retries: configVariables.APP_REQ_RETRY_MAX_ATTEMPTS, // number of retries
    retryDelay: (retryCount: number) => {
        if (retryCount === 0) return 0;
        return configVariables.APP_REQ_RETRY_DELAY;// time interval between retries
    },
    retryCondition: (error: AxiosError) => {
        const { response, code }: any = error;
        const { status } = response || {};
        if (RETRY_CODES?.includes(code)) return true;
        if (APP_REQ_RETRY_STATUS_CODES?.includes(`${status}`)) return true;
        return false;
    },
});





