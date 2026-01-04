import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { AssetAssignEntity } from '../../entities/asset-assign.entity';
import { AssetsService } from './services/assets.service';
import { AssetsController } from './controllers/assets.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([AssetInfoEntity, AssetAssignEntity])
    ],
    providers: [AssetsService],
    controllers: [AssetsController],
    exports: [AssetsService]
})
export class OperationsModule { }
