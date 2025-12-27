import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        return {
            type: 'mysql',
            host: configService.get<string>('DB_HOST', 'mysql-23784a63-ummidisettisai01-ebc2.g.aivencloud.com'),
            port: configService.get<number>('DB_PORT', 21240),
            username: configService.get<string>('DB_USERNAME', 'avnadmin'),
            password: configService.get<string>('DB_PASSWORD', 'AVNS_N--XstG5QvEDji4CFOQ'),
            database: configService.get<string>('DB_DATABASE', 'adminvault'),
            timezone: 'UTC',
            extra: {
                connectionLimit: configService.get<number>('DB_POOL_LIMIT', 10),
                charset: configService.get<string>('DB_CHARSET', 'utf8mb4'),
            },
            poolSize: configService.get<number>('DB_POOL_LIMIT', 10),
            supportBigNumbers: false,
            synchronize: false,
            logging: configService.get<string>('NODE_ENV') !== 'production',
            autoLoadEntities: true,
            ssl: configService.get<string>('DB_HOST')?.includes('aivencloud.com')
                ? { rejectUnauthorized: false }
                : false,
        };
    },
};
