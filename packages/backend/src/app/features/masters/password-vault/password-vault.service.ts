import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PasswordVaultRepository } from './repositories/password-vault.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreatePasswordVaultModel, UpdatePasswordVaultModel, GetAllPasswordVaultsResponseModel, IdRequestModel } from '@adminvault/shared-models';
import { PasswordVaultMasterEntity } from './entities/password-vault.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';

@Injectable()
export class PasswordVaultService {
    constructor(
        private dataSource: DataSource,
        private passwordVaultRepo: PasswordVaultRepository
    ) { }


    async createPasswordVault(reqModel: CreatePasswordVaultModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const saveEnt = new PasswordVaultMasterEntity();
            saveEnt.name = reqModel.name;
            saveEnt.password = reqModel.password;
            saveEnt.username = reqModel.username;
            saveEnt.url = reqModel.url;
            saveEnt.notes = reqModel.notes;
            saveEnt.description = reqModel.description;
            saveEnt.isActive = reqModel.isActive;
            saveEnt.userId = reqModel.userId;
            await transManager.getRepository(PasswordVaultMasterEntity).save(saveEnt);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 201, 'Password Vault created successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getAllPasswordVaults(): Promise<GetAllPasswordVaultsResponseModel> {
        try {
            const passwordVaults = await this.passwordVaultRepo.find();
            const passwordVaultsWithCompanyName = passwordVaults.map(vault => ({ id: vault.id, userId: vault.userId, createdAt: vault.createdAt, updatedAt: vault.updatedAt, name: vault.name, description: vault.description, isActive: vault.isActive, password: vault.password, username: vault.username, url: vault.url, notes: vault.notes, }));
            return new GetAllPasswordVaultsResponseModel(true, 200, 'Password Vaults retrieved successfully', passwordVaultsWithCompanyName);
        } catch (error) {
            throw error;
        }
    }
    async updatePasswordVault(reqModel: UpdatePasswordVaultModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.passwordVaultRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Password Vault not found');
            }

            await transManager.startTransaction();
            await transManager.getRepository(PasswordVaultMasterEntity).update(reqModel.id, { name: reqModel.name, password: reqModel.password, description: reqModel.description, isActive: reqModel.isActive, username: reqModel.username, url: reqModel.url, notes: reqModel.notes });
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Password Vault updated successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async deletePasswordVault(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const findPasswrd = await this.passwordVaultRepo.findOne({ where: { id: reqModel.id } });
            if (!findPasswrd) {
                throw new ErrorResponse(404, 'Password Vault not found');
            }
            await transManager.startTransaction();
            await transManager.getRepository(PasswordVaultMasterEntity).delete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Password Vault deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
