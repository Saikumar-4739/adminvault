import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

@Global()
@Module({
    imports: [
        CacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                store: await redisStore({
                    host: configService.get('redis.host'),
                    port: configService.get('redis.port'),
                    ttl: configService.get('redis.ttl') * 1000,
                }),
            }),
            inject: [ConfigService],
        }),
    ],
    exports: [CacheModule],
})
export class RedisCoreModule { }
