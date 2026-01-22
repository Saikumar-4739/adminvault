import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { VendorsMasterEntity } from './entities/vendor.entity';
import { VendorRepository } from './repositories/vendor.repository';
import { CompanyInfoModule } from '../company-info/company-info.module';

@Module({
    imports: [TypeOrmModule.forFeature([VendorsMasterEntity]), CompanyInfoModule],
    controllers: [VendorController],
    providers: [VendorService, VendorRepository],
    exports: [VendorService],
})
export class VendorModule { }
