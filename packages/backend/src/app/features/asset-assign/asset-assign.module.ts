import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetAssignEntity } from '../../entities/asset-assign.entity';
import { AssetAssignService } from './asset-assign.service';
import { AssetAssignController } from './asset-assign.controller';
import { AssetAssignRepository } from '../../repository/asset-assign.repository';

@Module({
    imports: [TypeOrmModule.forFeature([AssetAssignEntity])],
    controllers: [AssetAssignController],
    providers: [AssetAssignService, AssetAssignRepository],
    exports: [AssetAssignService],
})
export class AssetAssignModule { }
