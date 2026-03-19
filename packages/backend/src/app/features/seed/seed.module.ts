import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { AuditLogEntity } from '../audit-log/entities/audit-log.entity';
import { CredentialVaultEntity } from '../credential-vault/entities/credential-vault.entity';
import { DeviceHealthEntity } from '../device-health/entities/device-health.entity';
import { PolicyEntity, AccessReviewEntity } from '../compliance/entities/compliance.entity';
import { BillingEntity, VendorEntity, InvoiceEntity } from '../organization/entities/organization.entity';
import { ThreatEntity } from '../security/entities/threat.entity';
import { SecurityProtocolEntity } from '../security/entities/security-protocol.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AuditLogEntity,
            CredentialVaultEntity,
            DeviceHealthEntity,
            PolicyEntity,
            AccessReviewEntity,
            BillingEntity,
            VendorEntity,
            InvoiceEntity,
            ThreatEntity,
            SecurityProtocolEntity
        ])
    ],
    controllers: [SeedController],
    providers: [SeedService],
    exports: [SeedService]
})
export class SeedModule { }
