import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EmployeesRepository } from '../../repository/employees.repository';
import { EmployeesEntity } from '../../entities/employees.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class EmployeesService {
    constructor(
        private dataSource: DataSource,
        private employeesRepo: EmployeesRepository
    ) { }

    async findAll(): Promise<EmployeesEntity[]> {
        try {
            return await this.employeesRepo.find();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: number): Promise<EmployeesEntity> {
        try {
            const employee = await this.employeesRepo.findOne({ where: { id } });
            if (!employee) {
                throw new ErrorResponse(0, 'Employee not found');
            }
            return employee;
        } catch (error) {
            throw error;
        }
    }

    async findByCompany(companyId: number): Promise<EmployeesEntity[]> {
        try {
            return await this.employeesRepo.find({ where: { companyId } });
        } catch (error) {
            throw error;
        }
    }

    async create(dto: any): Promise<EmployeesEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const entity = this.employeesRepo.create(dto);
            const savedEntity = await transManager.getRepository(EmployeesEntity).save(entity);

            await transManager.completeTransaction();
            return savedEntity;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async update(id: number, dto: any): Promise<EmployeesEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'Employee not found');
            }

            await transManager.getRepository(EmployeesEntity).update(id, dto);
            const updated = await transManager.getRepository(EmployeesEntity).findOne({ where: { id } });

            await transManager.completeTransaction();
            return updated;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async remove(id: number): Promise<void> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'Employee not found');
            }

            await transManager.getRepository(EmployeesEntity).softDelete(id);

            await transManager.completeTransaction();
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
