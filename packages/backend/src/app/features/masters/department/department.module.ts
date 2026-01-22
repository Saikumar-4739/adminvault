import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { DepartmentsMasterEntity } from './entities/department.entity';
import { DepartmentRepository } from './repositories/department.repository';

@Module({
    imports: [TypeOrmModule.forFeature([DepartmentsMasterEntity])],
    controllers: [DepartmentController],
    providers: [DepartmentService, DepartmentRepository],
    exports: [DepartmentService],
})
export class DepartmentModule { }
