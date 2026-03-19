import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyEntity, AccessReviewEntity } from './entities/compliance.entity';

@Injectable()
export class ComplianceService {
    constructor(
        @InjectRepository(PolicyEntity)
        private policyRepo: Repository<PolicyEntity>,
        @InjectRepository(AccessReviewEntity)
        private reviewRepo: Repository<AccessReviewEntity>
    ) { }

    async getPolicies(companyId: number): Promise<any> {
        try {
            const policies = await this.policyRepo.find({ where: { companyId }, order: { createdAt: 'DESC' } });
            return { success: true, data: policies };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    async getAccessReviews(companyId: number): Promise<any> {
        try {
            const reviews = await this.reviewRepo.find({ where: { companyId }, order: { dueDate: 'ASC' } });
            return { success: true, data: reviews };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    async createPolicy(companyId: number, userId: number, data: any): Promise<any> {
        const policy = this.policyRepo.create({ ...data, companyId, createdBy: userId });
        await this.policyRepo.save(policy);
        return { success: true };
    }

    async createReview(companyId: number, data: any): Promise<any> {
        const review = this.reviewRepo.create({ ...data, companyId });
        await this.reviewRepo.save(review);
        return { success: true };
    }
}
