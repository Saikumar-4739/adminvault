import { Module, forwardRef } from '@nestjs/common';
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
import { AssetInfoController } from './asset-info.controller';
import { AssetInfoRepository } from './repositories/asset-info.repository';
import { AssetReturnHistoryRepository } from './repositories/asset-return-history.repository';
import { AssetNextAssignmentRepository } from './repositories/asset-next-assignment.repository';
import { AssetAssignRepository } from './repositories/asset-assign.repository';
import { EmployeesRepository } from '../employees/repositories/employees.repository';
import { WorkflowModule } from '../workflow/workflow.module';
import { SoftwareMasterEntity } from './entities/software-master.entity';
import { AssetSoftwareEntity } from './entities/asset-software.entity';
import { MaintenanceScheduleEntity } from './entities/maintenance-schedule.entity';
import { SoftwareService } from './software.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AssetInfoEntity,
            AssetReturnHistoryEntity,
            AssetNextAssignmentEntity,
            AssetAssignEntity,
            EmployeesEntity,
            SoftwareMasterEntity,
            AssetSoftwareEntity,
            MaintenanceScheduleEntity
        ]),
        forwardRef(() => WorkflowModule)
    ],
    controllers: [AssetInfoController],
    providers: [AssetInfoService, AssetTabsService, AssetBulkService, AssetHistoryService, AssetInfoRepository, AssetReturnHistoryRepository, AssetNextAssignmentRepository, AssetAssignRepository, EmployeesRepository, SoftwareService],
    exports: [AssetInfoService, AssetTabsService, AssetBulkService, AssetHistoryService, SoftwareService]
})
export class AssetInfoModule { }
