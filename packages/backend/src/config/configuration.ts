export default () => ({
    database: {
        type: 'postgres' as const,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        dbName: process.env.DB_DATABASE || 'adminvault',
        poolLimit: parseInt(process.env.DB_POOL_LIMIT || '10', 10),
    },
    app: {
        port: parseInt(process.env.PORT || '3000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
    },
});
