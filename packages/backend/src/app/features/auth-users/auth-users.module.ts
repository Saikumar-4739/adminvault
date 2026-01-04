import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUsersController } from './auth-users.controller';
import { AuthUsersService } from './auth-users.service';
import { AuthUsersEntity } from './entities/auth-users.entity';
import { AuthUsersRepository } from './repositories/auth-users.repository';
import { UserLoginSessionsEntity } from '../administration/entities/user-login-sessions.entity';
import { UserLoginSessionRepository } from '../administration/repositories/user-login-session.repository';
import { LoginSessionService } from './login-session.service';
import { LoginSessionController } from './login-session.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

import { forwardRef } from '@nestjs/common';
import { AdministrationModule } from '../administration/administration.module';

const SECRET_KEY = "2c6ee24b09816a6c6de4f1d3f8c3c0a6559dca86b6f710d930d3603fdbb724";

@Module({
    imports: [ forwardRef(() => AdministrationModule), PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.register({ secret: SECRET_KEY, signOptions: { expiresIn: '7d' }}), TypeOrmModule.forFeature([AuthUsersEntity, UserLoginSessionsEntity]) ],
    controllers: [AuthUsersController, LoginSessionController],
    providers: [ AuthUsersService, AuthUsersRepository, LoginSessionService, UserLoginSessionRepository, JwtStrategy],
    exports: [AuthUsersService, LoginSessionService, JwtModule, PassportModule]
})
export class AuthUsersModule { }
