import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandsMasterEntity } from './entities/brand.entity';
import { BrandRepository } from './repositories/brand.repository';
import { CompanyInfoModule } from '../company-info/company-info.module';

@Module({
    imports: [TypeOrmModule.forFeature([BrandsMasterEntity]), CompanyInfoModule],
    controllers: [BrandController],
    providers: [BrandService, BrandRepository],
    exports: [BrandService],
})
export class BrandModule { }
