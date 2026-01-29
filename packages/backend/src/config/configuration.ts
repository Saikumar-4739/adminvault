export default () => ({
    database: {
        type: 'mysql' as const,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        dbName: process.env.DB_DATABASE || 'adminvault',
        poolLimit: parseInt(process.env.DB_POOL_LIMIT || '10', 10),
        charset: process.env.DB_CHARSET || 'utf8mb4',
    },
    app: {
        port: parseInt(process.env.PORT || '3000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
    },
});
