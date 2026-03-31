import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceConfigService } from './brand.service';
import { DeviceConfigController } from './brand.controller';
import { DeviceConfigEntity } from './entities/brand.entity';
import { DeviceConfigRepository } from './repositories/brand.repository';
import { CompanyInfoRepository } from '../company-info/repositories/company-info.repository';
import { CompanyInfoEntity } from '../company-info/entities/company-info.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DeviceConfigEntity, CompanyInfoEntity])],
    controllers: [DeviceConfigController],
    providers: [DeviceConfigService, DeviceConfigRepository, CompanyInfoRepository],
    exports: [DeviceConfigService]
})
export class BrandModule { }
