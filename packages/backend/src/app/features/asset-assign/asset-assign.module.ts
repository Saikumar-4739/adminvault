import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetAssignEntity } from '../../entities/asset-assign.entity';
import { AssetAssignService } from './asset-assign.service';
import { AssetAssignController } from './asset-assign.controller';
import { AssetAssignRepository } from '../../repository/asset-assign.repository';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([AssetAssignEntity]),
        AuditLogsModule
    ],
    controllers: [AssetAssignController],
    providers: [AssetAssignService, AssetAssignRepository],
    exports: [AssetAssignService],
})
export class AssetAssignModule { }
