import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../audit-log/entities/audit-log.entity';
import { CredentialVaultEntity } from '../credential-vault/entities/credential-vault.entity';
import { DeviceHealthEntity } from '../device-health/entities/device-health.entity';
import { PolicyEntity, AccessReviewEntity } from '../compliance/entities/compliance.entity';
import { BillingEntity, VendorEntity, InvoiceEntity } from '../organization/entities/organization.entity';
import { ThreatEntity } from '../security/entities/threat.entity';
import { SecurityProtocolEntity } from '../security/entities/security-protocol.entity';
import { ThreatGravityEnum, ProtocolStatusEnum } from '@adminvault/shared-models';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(AuditLogEntity) private auditLogRepo: Repository<AuditLogEntity>,
        @InjectRepository(CredentialVaultEntity) private vaultRepo: Repository<CredentialVaultEntity>,
        @InjectRepository(DeviceHealthEntity) private deviceRepo: Repository<DeviceHealthEntity>,
        @InjectRepository(PolicyEntity) private policyRepo: Repository<PolicyEntity>,
        @InjectRepository(AccessReviewEntity) private reviewRepo: Repository<AccessReviewEntity>,
        @InjectRepository(BillingEntity) private billingRepo: Repository<BillingEntity>,
        @InjectRepository(VendorEntity) private vendorRepo: Repository<VendorEntity>,
        @InjectRepository(InvoiceEntity) private invoiceRepo: Repository<InvoiceEntity>,
        @InjectRepository(ThreatEntity) private threatRepo: Repository<ThreatEntity>,
        @InjectRepository(SecurityProtocolEntity) private protocolRepo: Repository<SecurityProtocolEntity>,
    ) { }

    async seedAll(companyId: number, userId: number): Promise<any> {
        // Clear existing for this company to avoid duplicates in demo
        await this.auditLogRepo.delete({ companyId });
        await this.vaultRepo.delete({ companyId });
        await this.deviceRepo.delete({ companyId });
        await this.policyRepo.delete({ companyId });
        await this.reviewRepo.delete({ companyId });
        await this.billingRepo.delete({ companyId });
        await this.vendorRepo.delete({ companyId });
        await this.invoiceRepo.delete({ companyId });
        await this.threatRepo.delete({ companyId });
        await this.protocolRepo.delete({ companyId });

        // 1. Audit Logs
        await this.auditLogRepo.save([
            { module: 'AUTH', action: 'LOGIN', description: 'User successfully logged in via MFA', ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', companyId, userId },
            { module: 'VAULT', action: 'ACCESS', description: 'Accessed production database credentials', ipAddress: '192.168.1.5', userAgent: 'AdminVault-Client', companyId, userId },
            { module: 'ASSETS', action: 'UPDATE', description: 'Updated hardware status for LAP-001', ipAddress: '10.0.0.42', userAgent: 'Mozilla/5.0', companyId, userId },
            { module: 'COMPLIANCE', action: 'REVIEW', description: 'Started Q1 Access Review cycle', ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', companyId, userId },
        ]);

        // 2. Credential Vault
        await this.vaultRepo.save([
            { title: 'Production DB Admin', username: 'db_admin_prod', password: 'ENCRYPTED_PLACEHOLDER', category: 'Database', description: 'Root access to the primary PostgreSQL cluster.', website: 'https://db.internal.company.com', companyId },
            { title: 'AWS Root IAM', username: 'cloud-master', password: 'ENCRYPTED_PLACEHOLDER', category: 'Infrastructure', description: 'Master account for AWS organization.', website: 'https://aws.amazon.com', companyId },
            { title: 'Slack Token', username: 'bot_user', password: 'ENCRYPTED_PLACEHOLDER', category: 'API Keys', description: 'Token for AdminVault notifications bot.', website: 'https://api.slack.com', companyId },
        ]);

        // 3. Device Health
        await this.deviceRepo.save([
            { assetTag: 'LAP-001', deviceName: 'MacBook Pro 16', type: 'Laptop', cpuUsage: 45, ramUsage: 62, diskUsage: 78, status: 'Healthy', operatingSystem: 'macOS 14.2', lastUser: 'John Doe', lastSync: new Date(), companyId },
            { assetTag: 'LAP-002', deviceName: 'Dell XPS 15', type: 'Laptop', cpuUsage: 88, ramUsage: 94, diskUsage: 45, status: 'Warning', operatingSystem: 'Windows 11', lastUser: 'Jane Smith', lastSync: new Date(Date.now() - 3600000), companyId },
            { assetTag: 'MOB-001', deviceName: 'iPhone 15 Pro', type: 'Mobile', cpuUsage: 12, ramUsage: 35, diskUsage: 92, status: 'Critical', operatingSystem: 'iOS 17.1', lastUser: 'Mike Ross', lastSync: new Date(Date.now() - 7200000), companyId },
        ]);

        // 4. Policies
        await this.policyRepo.save([
            { title: 'Information Security Policy', description: 'Core guidelines for protecting company data and IT assets.', category: 'Security', version: '2.4.0', status: 'Active', documentUrl: '/docs/sec-policy.pdf', companyId, createdBy: userId },
            { title: 'Remote Work Access', description: 'Procedures for VPN and remote endpoint security.', category: 'IT', version: '1.2.1', status: 'Active', documentUrl: '/docs/remote.pdf', companyId, createdBy: userId },
        ]);

        // 5. Access Reviews
        await this.reviewRepo.save([
            { reviewName: 'Annual Admin Audit', description: 'Review all privileged accounts.', status: 'In Progress', dueDate: new Date(Date.now() + 86400000 * 5), completionPercent: 65, reviewerId: userId, companyId },
            { reviewName: 'Sales CRM Sync', description: 'Validate access for regional sales team.', status: 'Open', dueDate: new Date(Date.now() + 86400000 * 14), completionPercent: 0, reviewerId: userId, companyId },
        ]);

        // 6. Billing
        await this.billingRepo.save([
            { planName: 'Enterprise Vault Plus', amount: 499, currency: 'USD', interval: 'Monthly', status: 'Active', nextBillingDate: new Date(Date.now() + 86400000 * 12), companyId },
        ]);

        // 7. Invoices
        await this.invoiceRepo.save([
            { invoiceNumber: 'INV-2024-001', amount: 499, status: 'Paid', invoiceDate: new Date(Date.now() - 86400000 * 30), companyId },
            { invoiceNumber: 'INV-2024-002', amount: 499, status: 'Paid', invoiceDate: new Date(Date.now() - 86400000 * 60), companyId },
            { invoiceNumber: 'INV-2024-003', amount: 499, status: 'Paid', invoiceDate: new Date(Date.now() - 86400000 * 90), companyId },
        ]);

        // 8. Vendors
        await this.vendorRepo.save([
            { name: 'Amazon Web Services', contactEmail: 'support@aws.amazon.com', category: 'Software', status: 'Preferred', website: 'https://aws.amazon.com', rating: 5, companyId },
            { name: 'Cloudflare Inc.', contactEmail: 'contact@cloudflare.com', category: 'Services', status: 'Preferred', website: 'https://cloudflare.com', rating: 5, companyId },
            { name: 'Dell Technologies', contactEmail: 'sales@dell.com', category: 'Hardware', status: 'Active', website: 'https://dell.com', rating: 4, companyId },
        ]);

        // 9. Security Threats
        await this.threatRepo.save([
            { type: 'Brute Force Attempt', source: 'IP: 192.168.1.105', status: 'Blocked', gravity: ThreatGravityEnum.HIGH, time: '2 mins ago', companyId },
            { type: 'Unauthorized Access', source: 'User: Unknown', status: 'Investigating', gravity: ThreatGravityEnum.CRITICAL, time: '15 mins ago', companyId },
            { type: 'Malware Detected', source: 'Asset: LAP-002', status: 'Isolated', gravity: ThreatGravityEnum.MEDIUM, time: '1 hour ago', companyId },
        ]);

        // 10. Security Protocols
        await this.protocolRepo.save([
            { name: 'Multi-Factor Authentication', description: 'Mandatory MFA for all administrative accounts.', status: ProtocolStatusEnum.ACTIVE, companyId },
            { name: 'Endpoint Encryption', description: 'Full disk encryption required for all company laptops.', status: ProtocolStatusEnum.MONITORING, companyId },
            { name: 'Network Segmentation', description: 'Isolating production environments from corporate office networks.', status: ProtocolStatusEnum.PENDING, companyId },
        ]);

        return { success: true, message: 'Seeding completed successfully' };
    }
}
