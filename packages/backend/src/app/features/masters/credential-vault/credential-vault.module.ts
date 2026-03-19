import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialVaultService } from './credential-vault.service';
import { CredentialVaultController } from './credential-vault.controller';
import { CredentialVaultEntity } from './entities/credential-vault.entity';
import { CredentialVaultRepository } from './repositories/credential-vault.repository';

@Module({
    imports: [TypeOrmModule.forFeature([CredentialVaultEntity])],
    controllers: [CredentialVaultController],
    providers: [CredentialVaultService, CredentialVaultRepository],
    exports: [CredentialVaultService],
})
export class CredentialVaultModule { }
