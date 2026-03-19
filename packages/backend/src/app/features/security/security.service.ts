import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThreatEntity } from './entities/threat.entity';
import { SecurityProtocolEntity } from './entities/security-protocol.entity';

@Injectable()
export class SecurityService {
    constructor(
        @InjectRepository(ThreatEntity)
        private threatRepository: Repository<ThreatEntity>,
        @InjectRepository(SecurityProtocolEntity)
        private protocolRepository: Repository<SecurityProtocolEntity>
    ) { }

    async getThreats(companyId: number): Promise<ThreatEntity[]> {
        return this.threatRepository.find({
            where: { companyId },
            order: { createdAt: 'DESC' }
        });
    }

    async getProtocols(companyId: number): Promise<SecurityProtocolEntity[]> {
        return this.protocolRepository.find({
            where: { companyId }
        });
    }

    async createThreat(threat: Partial<ThreatEntity>): Promise<ThreatEntity> {
        const newThreat = this.threatRepository.create(threat);
        return this.threatRepository.save(newThreat);
    }

    async createProtocol(protocol: Partial<SecurityProtocolEntity>): Promise<SecurityProtocolEntity> {
        const newProtocol = this.protocolRepository.create(protocol);
        return this.protocolRepository.save(newProtocol);
    }
}
