import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SlackUserEntity } from '../entities/slack-user.entity';

@Injectable()
export class SlackUserRepository extends Repository<SlackUserEntity> {
    constructor(private dataSource: DataSource) {
        super(SlackUserEntity, dataSource.createEntityManager());
    }
}
