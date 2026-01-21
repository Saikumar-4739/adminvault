import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PasswordVaultEntity } from '../entities/password-vault.entity';

@Injectable()
export class PasswordVaultRepository extends Repository<PasswordVaultEntity> {
    constructor(private dataSource: DataSource) {
        super(PasswordVaultEntity, dataSource.createEntityManager());
    }
}
