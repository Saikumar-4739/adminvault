import { Module, forwardRef, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailController } from './email.controller';
import { EmailInfoService } from './email-info.service';
import { EmailInfoEntity } from './entities/email-info.entity';
import { AccessRequestEntity } from './entities/access-request.entity';
import { EmailInfoRepository } from './repositories/email-info.repository';
import { AccessRequestRepository } from './repositories/access-request.repository';
import { AuthUsersModule } from '../auth-users/auth-users.module';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([EmailInfoEntity, AccessRequestEntity]),
        forwardRef(() => AuthUsersModule)
    ],
    controllers: [EmailController],
    providers: [
        EmailInfoService,
        EmailInfoRepository,
        AccessRequestRepository
    ],
    exports: [EmailInfoService, AccessRequestRepository]
})
export class EmailModule { }
