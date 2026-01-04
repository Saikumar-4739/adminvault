import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailInfoEntity } from './entities/email-info.entity';
import { EmailInfoService } from './email-info.service';
import { EmailInfoController } from './email-info.controller';
import { EmailInfoRepository } from './repositories/email-info.repository';

@Module({
    imports: [ TypeOrmModule.forFeature([EmailInfoEntity])],
    controllers: [EmailInfoController],
    providers: [ EmailInfoService, EmailInfoRepository ],
    exports: [EmailInfoService]
})
export class EmailInfoModule { }
