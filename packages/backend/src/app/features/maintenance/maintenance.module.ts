import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceScheduleEntity } from './entities/maintenance-schedule.entity';
import { AssetInfoEntity } from '../asset-info/entities/asset-info.entity';
import { MaintenanceRepository } from './repositories/maintenance.repository';
import { AssetInfoRepository } from '../asset-info/repositories/asset-info.repository';

@Module({
    imports: [TypeOrmModule.forFeature([MaintenanceScheduleEntity, AssetInfoEntity])],
    controllers: [MaintenanceController],
    providers: [MaintenanceService, MaintenanceRepository, AssetInfoRepository],
    exports: [MaintenanceService]
})
export class MaintenanceModule { }
