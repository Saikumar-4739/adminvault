import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthUsersRepository } from '../../repository/auth-users.repository';
import { AuthUsersEntity } from '../../entities/auth-users.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class AuthUsersService {
    constructor(
        private dataSource: DataSource,
        private authUsersRepo: AuthUsersRepository
    ) { }

    async findAll(): Promise<AuthUsersEntity[]> {
        try {
            return await this.authUsersRepo.find();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: number): Promise<AuthUsersEntity> {
        try {
            const user = await this.authUsersRepo.findOne({ where: { id } });
            if (!user) {
                throw new ErrorResponse(0, 'User not found');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    async findByEmail(email: string): Promise<AuthUsersEntity> {
        try {
            const user = await this.authUsersRepo.findOne({ where: { email } });
            if (!user) {
                throw new ErrorResponse(0, 'User not found with this email');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    async create(dto: any): Promise<AuthUsersEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            // Check if email already exists
            const existingUser = await this.authUsersRepo.findOne({ where: { email: dto.email } });
            if (existingUser) {
                throw new ErrorResponse(0, 'User with this email already exists');
            }

            const entity = this.authUsersRepo.create(dto);
            const savedEntity = await transManager.getRepository(AuthUsersEntity).save(entity);

            await transManager.completeTransaction();
            return savedEntity;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async update(id: number, dto: any): Promise<AuthUsersEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'User not found');
            }

            // If email is being updated, check for duplicates
            if (dto.email && dto.email !== existing.email) {
                const emailExists = await this.authUsersRepo.findOne({ where: { email: dto.email } });
                if (emailExists) {
                    throw new ErrorResponse(0, 'Email already in use');
                }
            }

            await transManager.getRepository(AuthUsersEntity).update(id, dto);
            const updated = await transManager.getRepository(AuthUsersEntity).findOne({ where: { id } });

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
                throw new ErrorResponse(0, 'User not found');
            }

            await transManager.getRepository(AuthUsersEntity).softDelete(id);

            await transManager.completeTransaction();
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
