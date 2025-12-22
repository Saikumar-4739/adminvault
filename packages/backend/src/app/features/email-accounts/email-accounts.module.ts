import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailAccountsEntity } from '../../entities/email-accounts.entity';
import { EmailAccountsController } from './email-accounts.controller';
import { EmailAccountsService } from './email-accounts.service';

@Module({
    imports: [TypeOrmModule.forFeature([EmailAccountsEntity])],
    controllers: [EmailAccountsController],
    providers: [EmailAccountsService],
    exports: [EmailAccountsService]
})
export class EmailAccountsModule { }
