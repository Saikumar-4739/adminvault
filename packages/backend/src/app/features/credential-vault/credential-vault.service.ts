import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CredentialVaultEntity } from './entities/credential-vault.entity';
import { GlobalResponse } from '@adminvault/shared-models';
import * as crypto from 'crypto';

@Injectable()
export class CredentialVaultService {
    private readonly algorithm = 'aes-256-ctr';
    private readonly secretKey = process.env.VAULT_SECRET_KEY || 'v3ry-s3cr3t-k3y-f0r-v4ult-4dm1n';
    private readonly iv = crypto.randomBytes(16);

    constructor(
        @InjectRepository(CredentialVaultEntity)
        private repository: Repository<CredentialVaultEntity>
    ) { }

    private encrypt(text: string): string {
        const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, this.iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return `${this.iv.toString('hex')}:${encrypted.toString('hex')}`;
    }

    private decrypt(hash: string): string {
        const [iv, content] = hash.split(':');
        const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, Buffer.from(iv, 'hex'));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);
        return decrypted.toString();
    }

    async createCredential(userId: number, companyId: number, data: any): Promise<GlobalResponse> {
        try {
            const credential = new CredentialVaultEntity();
            credential.title = data.title;
            credential.description = data.description;
            credential.username = data.username;
            credential.password = this.encrypt(data.password);
            credential.url = data.url;
            credential.notes = data.notes;
            credential.category = data.category;
            credential.ownerId = userId;
            credential.companyId = companyId;

            await this.repository.save(credential);
            return new GlobalResponse(true, 201, 'Credential stored securely');
        } catch (error: any) {
            return new GlobalResponse(false, 500, error.message);
        }
    }

    async getCredentials(companyId: number): Promise<any> {
        try {
            const credentials = await this.repository.find({
                where: { companyId },
                order: { createdAt: 'DESC' }
            });
            return {
                success: true,
                data: credentials.map(c => ({
                    ...c,
                    password: '••••••••' // Mask password by default
                }))
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    async revealPassword(id: number): Promise<any> {
        try {
            const credential = await this.repository.findOne({ where: { id } });
            if (!credential) return { success: false, message: 'Credential not found' };

            return {
                success: true,
                password: this.decrypt(credential.password)
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    async deleteCredential(id: number): Promise<GlobalResponse> {
        try {
            await this.repository.softDelete(id);
            return new GlobalResponse(true, 200, 'Credential removed');
        } catch (error: any) {
            return new GlobalResponse(false, 500, error.message);
        }
    }
}
