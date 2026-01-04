import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceInfoEntity } from '../../../entities/device-info.entity';
import { DeviceInfoService } from './device-info.service';
import { DeviceInfoController } from './device-info.controller';
import { DeviceInfoRepository } from '../../../repository/device-info.repository';

import { AuditLogsModule } from '../../audit-logs/audit-logs.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DeviceInfoEntity]),
        AuditLogsModule
    ],
    controllers: [DeviceInfoController],
    providers: [DeviceInfoService, DeviceInfoRepository],
    exports: [DeviceInfoService],
})
export class DeviceInfoModule { }
