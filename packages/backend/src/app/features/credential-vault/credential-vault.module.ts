import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialVaultController } from './credential-vault.controller';
import { CredentialVaultService } from './credential-vault.service';
import { CredentialVaultEntity } from './entities/credential-vault.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CredentialVaultEntity])],
    controllers: [CredentialVaultController],
    providers: [CredentialVaultService],
    exports: [CredentialVaultService]
})
export class CredentialVaultModule { }
