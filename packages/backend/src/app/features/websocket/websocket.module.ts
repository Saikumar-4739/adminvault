import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppWebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { NetworkModule } from '../network/network.module';
import { NetworkService } from '../network/network.service';

@Module({
    imports: [JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '7d' }, }), NetworkModule],
    providers: [AppWebSocketGateway, WebSocketService],
    exports: [AppWebSocketGateway, WebSocketService],
})

export class WebSocketModule {
    constructor(
        private readonly gateway: AppWebSocketGateway,
        private readonly networkService: NetworkService,
    ) {
        this.gateway.setNetworkService(this.networkService);
    }
}
