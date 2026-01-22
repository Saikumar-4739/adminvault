import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetTypeService } from './asset-type.service';
import { AssetTypeController } from './asset-type.controller';
import { AssetTypeMasterEntity } from './entities/asset-type.entity';
import { AssetTypeRepository } from './repositories/asset-type.repository';
import { CompanyInfoModule } from '../company-info/company-info.module';

@Module({
    imports: [TypeOrmModule.forFeature([AssetTypeMasterEntity]), CompanyInfoModule],
    controllers: [AssetTypeController],
    providers: [AssetTypeService, AssetTypeRepository],
    exports: [AssetTypeService],
})
export class AssetTypeModule { }
