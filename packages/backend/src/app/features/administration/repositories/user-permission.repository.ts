import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserPermissionEntity } from '../entities/user-permission.entity';

@Injectable()
export class UserPermissionRepository extends Repository<UserPermissionEntity> {
    constructor(private dataSource: DataSource) {
        super(UserPermissionEntity, dataSource.createEntityManager());
    }
}
