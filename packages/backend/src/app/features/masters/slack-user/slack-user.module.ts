import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackUserService } from './slack-user.service';
import { SlackUserController } from './slack-user.controller';
import { SlackUsersMasterEntity } from './entities/slack-user.entity';
import { SlackUsersRepository } from './repositories/slack-user.repository';

@Module({
    imports: [TypeOrmModule.forFeature([SlackUsersMasterEntity])],
    controllers: [SlackUserController],
    providers: [SlackUserService, SlackUsersRepository],
    exports: [SlackUserService],
})
export class SlackUserModule { }
