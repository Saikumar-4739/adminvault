import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {
    constructor() {
        console.log('DashboardModule loaded');
    }
}
