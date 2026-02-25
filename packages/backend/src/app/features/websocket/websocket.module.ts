import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppWebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { NetworkModule } from '../network/network.module';
import { NetworkService } from '../network/network.service';

/**
 * WebSocket Module
 * Provides real-time communication functionality
 */
@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || '2c6ee24b09816a6c6de4f1d3f8c3c0a6559dca86b6f710d930d3603fdbb724',
            signOptions: { expiresIn: '7d' },
        }),
        NetworkModule,
    ],
    providers: [AppWebSocketGateway, WebSocketService],
    exports: [AppWebSocketGateway, WebSocketService],
})
export class WebSocketModule {
    constructor(
        private readonly gateway: AppWebSocketGateway,
        private readonly networkService: NetworkService,
    ) {
        // Inject network service into gateway
        this.gateway.setNetworkService(this.networkService);
    }
}
