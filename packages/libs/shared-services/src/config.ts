// require('dotenv').config();
export interface ConfigType {
    APP_AVS_SERVICE_URL: string;
    APP_RETRY_CODES?: string;
    APP_REQ_RETRY_STATUS_CODES?: string;
    APP_REQ_RETRY_MAX_ATTEMPTS: number;
    APP_REQ_RETRY_DELAY: number;
}

export const configVariables: ConfigType = {
    APP_AVS_SERVICE_URL: ((typeof window !== 'undefined') ? window['_env_']?.['APP_AVS_SERVICE_URL'] : process.env['APP_AVS_SERVICE_URL']) || 'https://adminvault.onrender.com',
    APP_RETRY_CODES: (typeof window !== 'undefined') ? window['_env_']?.['APP_RETRY_CODES'] : process.env['APP_RETRY_CODES'] || 'ECONNABORTED,ETIMEDOUT,ENOTFOUND',
    APP_REQ_RETRY_STATUS_CODES: (typeof window !== 'undefined') ? window['_env_']?.['APP_REQ_RETRY_STATUS_CODES'] : process.env['APP_REQ_RETRY_STATUS_CODES'] || '408,429,500,502,503,504',
    APP_REQ_RETRY_MAX_ATTEMPTS: Number((typeof window !== 'undefined') ? window['_env_']?.['APP_REQ_RETRY_MAX_ATTEMPTS'] : process.env['APP_REQ_RETRY_MAX_ATTEMPTS']) || 3,
    APP_REQ_RETRY_DELAY: Number((typeof window !== 'undefined') ? window['_env_']?.['APP_REQ_RETRY_DELAY'] : process.env['APP_REQ_RETRY_DELAY']) || 1000,
}
