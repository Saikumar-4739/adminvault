import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RoleMenuAccessEntity } from '../entities/role-menu-access.entity';

@Injectable()
export class RoleMenuAccessRepository extends Repository<RoleMenuAccessEntity> {
    constructor(private dataSource: DataSource) {
        super(RoleMenuAccessEntity, dataSource.createEntityManager());
    }
}
