import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { AssetReturnHistoryEntity } from '../../entities/asset-return-history.entity';
import { AssetNextAssignmentEntity } from '../../entities/asset-next-assignment.entity';
import { EmployeesEntity } from '../../entities/employees.entity';
import { AssetInfoService } from './asset-info.service';
import { AssetTabsService } from './asset-tabs.service';
import { AssetBulkService } from './asset-bulk.service';
import { AssetHistoryService } from './asset-history.service';
import { AssetInfoController } from './asset-info.controller';
import { AssetInfoRepository } from '../../repository/asset-info.repository';
import { AssetReturnHistoryRepository } from '../../repository/asset-return-history.repository';
import { AssetNextAssignmentRepository } from '../../repository/asset-next-assignment.repository';

@Module({
    imports: [TypeOrmModule.forFeature([AssetInfoEntity, AssetReturnHistoryEntity, AssetNextAssignmentEntity, EmployeesEntity])],
    controllers: [AssetInfoController],
    providers: [AssetInfoService, AssetTabsService, AssetBulkService, AssetHistoryService, AssetInfoRepository, AssetReturnHistoryRepository, AssetNextAssignmentRepository],
    exports: [AssetInfoService, AssetTabsService, AssetBulkService, AssetHistoryService],
})
export class AssetInfoModule { }
