import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PasswordVaultRepository } from './repositories/password-vault.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreatePasswordVaultModel, UpdatePasswordVaultModel, GetAllPasswordVaultsResponseModel, CreatePasswordVaultResponseModel, UpdatePasswordVaultResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { PasswordVaultMasterEntity } from './entities/password-vault.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';

@Injectable()
export class PasswordVaultService {
    constructor(
        private dataSource: DataSource,
        private passwordVaultRepo: PasswordVaultRepository
    ) { }

    async getAllPasswordVaults(reqModel: CompanyIdRequestModel): Promise<GetAllPasswordVaultsResponseModel> {
        try {
            const passwordVaults = await this.passwordVaultRepo.find();
            return new GetAllPasswordVaultsResponseModel(true, 200, 'Password Vaults retrieved successfully', passwordVaults);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Password Vaults');
        }
    }

    async createPasswordVault(data: CreatePasswordVaultModel, userId?: number, ipAddress?: string): Promise<CreatePasswordVaultResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(PasswordVaultMasterEntity);
            const { companyId, ...createData } = data;
            const newItem = repo.create(createData);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();

            return new CreatePasswordVaultResponseModel(true, 201, 'Password Vault created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Password Vault');
        }
    }

    async updatePasswordVault(data: UpdatePasswordVaultModel, userId?: number, ipAddress?: string): Promise<UpdatePasswordVaultResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.passwordVaultRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Password Vault not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(PasswordVaultMasterEntity);
            await repo.save({
                id: data.id,
                name: data.name,
                password: data.password,
                description: data.description,
                isActive: data.isActive,
                username: data.username,
                url: data.url,
                notes: data.notes
            });
            const updated = await repo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated password vault');
            }
            await transManager.completeTransaction();

            return new UpdatePasswordVaultResponseModel(true, 200, 'Password Vault updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Password Vault');
        }
    }

    async deletePasswordVault(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(PasswordVaultMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } });
            if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 200, 'Password Vault deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Password Vault');
        }
    }
}
