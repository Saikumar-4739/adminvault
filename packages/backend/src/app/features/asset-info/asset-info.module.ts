import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { AssetInfoService } from './asset-info.service';
import { AssetInfoController } from './asset-info.controller';
import { AssetInfoRepository } from '../../repository/asset-info.repository';

@Module({
    imports: [TypeOrmModule.forFeature([AssetInfoEntity])],
    controllers: [AssetInfoController],
    providers: [AssetInfoService, AssetInfoRepository],
    exports: [AssetInfoService],
})
export class AssetInfoModule { }
