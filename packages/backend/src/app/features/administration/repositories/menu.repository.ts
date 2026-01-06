import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MenuEntity } from '../entities/menu.entity';

@Injectable()
export class MenuRepository extends Repository<MenuEntity> {
    constructor(private dataSource: DataSource) {
        super(MenuEntity, dataSource.createEntityManager());
    }
}
