import { Module } from '@nestjs/common';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';

/**
 * Network Monitoring Module
 * Provides network statistics and health monitoring functionality
 */
@Module({
    controllers: [NetworkController],
    providers: [NetworkService],
    exports: [NetworkService],
})
export class NetworkModule { }
