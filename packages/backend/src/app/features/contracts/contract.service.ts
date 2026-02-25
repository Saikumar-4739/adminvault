import { Injectable } from '@nestjs/common';
import { DataSource, LessThanOrEqual } from 'typeorm';
import { ContractRepository } from './repositories/contract.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import {
    CreateContractModel,
    UpdateContractModel,
    ContractResponseModel,
    IdRequestModel
} from '@adminvault/shared-models';
import { ContractEntity } from './entities/contract.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';

@Injectable()
export class ContractService {
    constructor(
        private dataSource: DataSource,
        private contractRepo: ContractRepository
    ) { }

    async createContract(reqModel: CreateContractModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const contract = new ContractEntity();
            Object.assign(contract, reqModel);

            await transManager.getRepository(ContractEntity).save(contract);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 201, 'Contract created successfully', contract);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getAllContracts(): Promise<GlobalResponse> {
        try {
            const contracts = await this.contractRepo.find({
                relations: ['vendor']
            });
            return new GlobalResponse(true, 200, 'Contracts retrieved successfully', contracts);
        } catch (error) {
            throw error;
        }
    }

    async getExpiringContracts(days: number = 30): Promise<GlobalResponse> {
        try {
            const expiryDateLimit = new Date();
            expiryDateLimit.setDate(expiryDateLimit.getDate() + days);

            const contracts = await this.contractRepo.find({
                where: {
                    endDate: LessThanOrEqual(expiryDateLimit)
                },
                relations: ['vendor']
            });
            return new GlobalResponse(true, 200, 'Expiring contracts retrieved successfully', contracts);
        } catch (error) {
            throw error;
        }
    }

    async updateContract(reqModel: UpdateContractModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.contractRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Contract not found');
            }

            await transManager.startTransaction();
            await transManager.getRepository(ContractEntity).update(reqModel.id, reqModel);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 200, 'Contract updated successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async deleteContract(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            await transManager.getRepository(ContractEntity).delete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Contract deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
