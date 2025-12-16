import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItAdminEntity } from '../../entities/it-admin.entity';
import { ItAdminService } from './it-admin.service';
import { ItAdminController } from './it-admin.controller';
import { ItAdminRepository } from '../../repository/it-admin.repository';

@Module({
    imports: [TypeOrmModule.forFeature([ItAdminEntity])],
    controllers: [ItAdminController],
    providers: [ItAdminService, ItAdminRepository],
    exports: [ItAdminService],
})
export class ItAdminModule { }
