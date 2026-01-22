import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordVaultService } from './password-vault.service';
import { PasswordVaultController } from './password-vault.controller';
import { PasswordVaultMasterEntity } from './entities/password-vault.entity';
import { PasswordVaultRepository } from './repositories/password-vault.repository';

@Module({
    imports: [TypeOrmModule.forFeature([PasswordVaultMasterEntity])],
    controllers: [PasswordVaultController],
    providers: [PasswordVaultService, PasswordVaultRepository],
    exports: [PasswordVaultService],
})
export class PasswordVaultModule { }
