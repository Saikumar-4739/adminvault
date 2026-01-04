import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordVaultController } from './password-vault.controller';
import { PasswordVaultService } from './password-vault.service';
import { PasswordVaultEntity } from './entities/password-vault.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PasswordVaultEntity])],
    controllers: [PasswordVaultController],
    providers: [PasswordVaultService],
    exports: [PasswordVaultService],
})
export class PasswordVaultModule { }
