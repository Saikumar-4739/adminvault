import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUsersController } from './auth-users.controller';
import { AuthUsersService } from './auth-users.service';
import { AuthUsersEntity } from '../../entities/auth-users.entity';
import { AuthUsersRepository } from '../../repository/auth-users.repository';
import { UserLoginSessionEntity } from '../../entities/user-login-sessions.entity';
import { UserLoginSessionRepository } from '../../repository/user-login-session.repository';
import { LoginSessionService } from './login-session.service';
import { LoginSessionController } from './login-session.controller';

import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        MailModule,
        TypeOrmModule.forFeature([AuthUsersEntity, UserLoginSessionEntity])
    ],
    controllers: [AuthUsersController, LoginSessionController],
    providers: [
        AuthUsersService,
        AuthUsersRepository,
        LoginSessionService,
        UserLoginSessionRepository
    ],
    exports: [AuthUsersService, LoginSessionService]
})
export class AuthUsersModule { }
