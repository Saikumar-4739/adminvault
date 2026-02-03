import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST', ''),
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get<string>('DB_USERNAME', ''),
            password: configService.get<string>('DB_PASSWORD', ''),
            database: configService.get<string>('DB_DATABASE', ''),
            synchronize: false,
            logging: configService.get<string>('NODE_ENV') !== 'production',
            autoLoadEntities: true,
            ssl: configService.get<string>('DB_HOST')?.includes('aivencloud.com')
                ? { rejectUnauthorized: false }
                : false,
        };
    },
};
