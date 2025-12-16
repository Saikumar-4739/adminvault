import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailAccountsEntity } from '../../entities/email-accounts.entity';
import { EmailAccountsService } from './email-accounts.service';
import { EmailAccountsController } from './email-accounts.controller';
import { EmailAccountsRepository } from '../../repository/email-accounts.repository';

@Module({
    imports: [TypeOrmModule.forFeature([EmailAccountsEntity])],
    controllers: [EmailAccountsController],
    providers: [EmailAccountsService, EmailAccountsRepository],
    exports: [EmailAccountsService],
})
export class EmailAccountsModule { }
