import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUsersEntity } from '../../entities/auth-users.entity';
import { AuthUsersService } from './auth-users.service';
import { AuthUsersController } from './auth-users.controller';
import { AuthUsersRepository } from '../../repository/auth-users.repository';

@Module({
    imports: [TypeOrmModule.forFeature([AuthUsersEntity])],
    controllers: [AuthUsersController],
    providers: [AuthUsersService, AuthUsersRepository],
    exports: [AuthUsersService],
})
export class AuthUsersModule { }
