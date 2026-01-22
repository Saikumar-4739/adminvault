import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SlackUsersMasterEntity } from '../entities/slack-user.entity';

@Injectable()
export class SlackUsersRepository extends Repository<SlackUsersMasterEntity> {
    constructor(private dataSource: DataSource) {
        super(SlackUsersMasterEntity, dataSource.createEntityManager());
    }
}
