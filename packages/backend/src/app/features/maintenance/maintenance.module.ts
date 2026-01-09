import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceScheduleEntity } from '../asset-info/entities/maintenance-schedule.entity';
import { AssetInfoEntity } from '../asset-info/entities/asset-info.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([MaintenanceScheduleEntity, AssetInfoEntity])
    ],
    controllers: [MaintenanceController],
    providers: [MaintenanceService],
    exports: [MaintenanceService]
})
export class MaintenanceModule { }
