import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyInfoEntity } from '../../entities/company-info.entity';
import { CompanyInfoService } from './company-info.service';
import { CompanyInfoController } from './company-info.controller';
import { CompanyInfoRepository } from '../../repository/company-info.repository';

@Module({
    imports: [TypeOrmModule.forFeature([CompanyInfoEntity])],
    controllers: [CompanyInfoController],
    providers: [CompanyInfoService, CompanyInfoRepository],
    exports: [CompanyInfoService],
})
export class CompanyInfoModule { }
