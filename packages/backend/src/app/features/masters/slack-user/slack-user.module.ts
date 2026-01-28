import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackUserService } from './slack-user.service';
import { SlackUserController } from './slack-user.controller';
import { SlackUsersMasterEntity } from './entities/slack-user.entity';
import { SlackUsersRepository } from './repositories/slack-user.repository';
import { EmployeesModule } from '../../employees/employees.module';
import { CompanyInfoRepository } from '../company-info/repositories/company-info.repository';

@Module({
    imports: [TypeOrmModule.forFeature([SlackUsersMasterEntity]), EmployeesModule],
    controllers: [SlackUserController],
    providers: [SlackUserService, SlackUsersRepository, CompanyInfoRepository],
    exports: [SlackUserService],
})
export class SlackUserModule { }
