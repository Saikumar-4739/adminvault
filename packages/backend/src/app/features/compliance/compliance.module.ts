import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { PolicyEntity, AccessReviewEntity } from './entities/compliance.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PolicyEntity, AccessReviewEntity])],
    controllers: [ComplianceController],
    providers: [ComplianceService],
    exports: [ComplianceService]
})
export class ComplianceModule { }
