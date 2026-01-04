import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetInfoEntity } from './entities/asset-info.entity';
import { AssetReturnHistoryEntity } from './entities/asset-return-history.entity';
import { AssetNextAssignmentEntity } from './entities/asset-next-assignment.entity';
import { AssetAssignEntity } from './entities/asset-assign.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';
import { AssetInfoService } from './asset-info.service';
import { AssetTabsService } from './asset-tabs.service';
import { AssetBulkService } from './asset-bulk.service';
import { AssetHistoryService } from './asset-history.service';
import { AssetAssignService } from './asset-assign.service';
import { AssetInfoController } from './asset-info.controller';
import { AssetInfoRepository } from './repositories/asset-info.repository';
import { AssetReturnHistoryRepository } from './repositories/asset-return-history.repository';
import { AssetNextAssignmentRepository } from './repositories/asset-next-assignment.repository';
import { AssetAssignRepository } from './repositories/asset-assign.repository';

@Module({
    imports: [TypeOrmModule.forFeature([AssetInfoEntity, AssetReturnHistoryEntity, AssetNextAssignmentEntity, AssetAssignEntity, EmployeesEntity])],
    controllers: [AssetInfoController],
    providers: [AssetInfoService, AssetTabsService, AssetBulkService, AssetHistoryService, AssetAssignService, AssetInfoRepository, AssetReturnHistoryRepository, AssetNextAssignmentRepository, AssetAssignRepository],
    exports: [AssetInfoService, AssetTabsService, AssetBulkService, AssetHistoryService, AssetAssignService]
})
export class AssetInfoModule { }
