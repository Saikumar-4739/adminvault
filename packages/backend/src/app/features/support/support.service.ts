import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicketEntity, SupportTicketStatus, SupportTicketPriority, SupportCategory } from '../../entities/support-ticket.entity';

@Injectable()
export class SupportService {
    constructor(
        @InjectRepository(SupportTicketEntity)
        private readonly supportRepository: Repository<SupportTicketEntity>,
    ) { }

    async findAll(companyId: number): Promise<SupportTicketEntity[]> {
        return await this.supportRepository.find({
            where: { companyId },
            relations: ['creator', 'assignee'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUser(userId: number): Promise<SupportTicketEntity[]> {
        return await this.supportRepository.find({
            where: { createdBy: userId },
            relations: ['assignee'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<SupportTicketEntity> {
        return await this.supportRepository.findOne({
            where: { id },
            relations: ['creator', 'assignee'],
        });
    }

    async create(data: Partial<SupportTicketEntity>): Promise<SupportTicketEntity> {
        const ticket = this.supportRepository.create(data);
        return await this.supportRepository.save(ticket);
    }

    async update(id: number, data: Partial<SupportTicketEntity>): Promise<SupportTicketEntity> {
        await this.supportRepository.update(id, data);
        return await this.findOne(id);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.supportRepository.delete(id);
        return result.affected > 0;
    }

    async updateStatus(id: number, status: SupportTicketStatus): Promise<SupportTicketEntity> {
        const updateData: any = { status };

        if (status === SupportTicketStatus.RESOLVED || status === SupportTicketStatus.CLOSED) {
            updateData.resolvedAt = new Date();
        }

        await this.supportRepository.update(id, updateData);
        return await this.findOne(id);
    }

    async assignTicket(id: number, assignedTo: number): Promise<SupportTicketEntity> {
        await this.supportRepository.update(id, {
            assignedTo,
            status: SupportTicketStatus.IN_PROGRESS,
        });
        return await this.findOne(id);
    }

    async addResponse(id: number, response: string): Promise<SupportTicketEntity> {
        await this.supportRepository.update(id, { response });
        return await this.findOne(id);
    }

    async getStatistics(companyId: number): Promise<any> {
        const tickets = await this.findAll(companyId);

        return {
            total: tickets.length,
            open: tickets.filter(t => t.status === SupportTicketStatus.OPEN).length,
            inProgress: tickets.filter(t => t.status === SupportTicketStatus.IN_PROGRESS).length,
            resolved: tickets.filter(t => t.status === SupportTicketStatus.RESOLVED).length,
            closed: tickets.filter(t => t.status === SupportTicketStatus.CLOSED).length,
            byPriority: {
                urgent: tickets.filter(t => t.priority === SupportTicketPriority.URGENT).length,
                high: tickets.filter(t => t.priority === SupportTicketPriority.HIGH).length,
                medium: tickets.filter(t => t.priority === SupportTicketPriority.MEDIUM).length,
                low: tickets.filter(t => t.priority === SupportTicketPriority.LOW).length,
            },
            byCategory: {
                technical: tickets.filter(t => t.category === SupportCategory.TECHNICAL).length,
                billing: tickets.filter(t => t.category === SupportCategory.BILLING).length,
                featureRequest: tickets.filter(t => t.category === SupportCategory.FEATURE_REQUEST).length,
                bugReport: tickets.filter(t => t.category === SupportCategory.BUG_REPORT).length,
                general: tickets.filter(t => t.category === SupportCategory.GENERAL).length,
            },
        };
    }
}
