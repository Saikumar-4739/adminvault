// Type declarations for environment variables on window object
declare global {
    interface Window {
        _env_?: {
            APP_AVS_SERVICE_URL?: string;
            APP_RETRY_CODES?: string;
            APP_REQ_RETRY_STATUS_CODES?: string;
            APP_REQ_RETRY_MAX_ATTEMPTS?: string;
            APP_REQ_RETRY_DELAY?: string;
        };
    }
}

export { };
