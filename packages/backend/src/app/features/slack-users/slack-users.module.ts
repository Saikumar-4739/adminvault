import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackUserEntity } from '../../entities/slack-user.entity';
import { SlackUsersService } from './slack-users.service';
import { SlackUsersController } from './slack-users.controller';
import { SlackUserRepository } from '../../repository/slack-user.repository';

@Module({
    imports: [TypeOrmModule.forFeature([SlackUserEntity])],
    controllers: [SlackUsersController],
    providers: [SlackUsersService, SlackUserRepository],
    exports: [SlackUsersService],
})
export class SlackUsersModule { }
