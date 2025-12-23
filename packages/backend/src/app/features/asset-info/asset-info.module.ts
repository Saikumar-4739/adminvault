import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { AssetReturnHistoryEntity } from '../../entities/asset-return-history.entity';
import { AssetNextAssignmentEntity } from '../../entities/asset-next-assignment.entity';
import { AssetInfoService } from './asset-info.service';
import { AssetTabsService } from './asset-tabs.service';
import { AssetInfoController } from './asset-info.controller';
import { AssetInfoRepository } from '../../repository/asset-info.repository';
import { AssetReturnHistoryRepository } from '../../repository/asset-return-history.repository';
import { AssetNextAssignmentRepository } from '../../repository/asset-next-assignment.repository';

@Module({
    imports: [TypeOrmModule.forFeature([AssetInfoEntity, AssetReturnHistoryEntity, AssetNextAssignmentEntity])],
    controllers: [AssetInfoController],
    providers: [AssetInfoService, AssetTabsService, AssetInfoRepository, AssetReturnHistoryRepository, AssetNextAssignmentRepository],
    exports: [AssetInfoService, AssetTabsService],
})
export class AssetInfoModule { }
