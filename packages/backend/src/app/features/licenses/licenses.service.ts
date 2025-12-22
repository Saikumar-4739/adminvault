
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyLicenseEntity } from '../../entities/company-license.entity';

@Injectable()
export class LicensesService {
    constructor(
        @InjectRepository(CompanyLicenseEntity)
        private repo: Repository<CompanyLicenseEntity>
    ) { }

    async findAll(companyId?: number) {
        const query = this.repo.createQueryBuilder('license')
            .leftJoinAndSelect('license.company', 'company')
            .leftJoinAndSelect('license.application', 'application')
            .leftJoinAndSelect('license.assignedEmployee', 'assignedEmployee')
            .orderBy('license.createdAt', 'DESC');

        if (companyId) {
            query.where('license.companyId = :companyId', { companyId });
        }

        const licenses = await query.getMany();
        return { status: true, data: licenses };
    }

    async getStats(companyId?: number) {
        const query = this.repo.createQueryBuilder('license');

        if (companyId) {
            query.where('license.companyId = :companyId', { companyId });
        }

        const licenses = await query.getMany();

        const total = licenses.length;
        // In the new model, every record is an assignment, so 'used' is effectively the count of active assignments.
        // We can define 'used' as 'not expired' maybe? Or just keep it same as total for now to represent 'Assigned Count'.
        const used = total;

        // Cost is removed, set to 0
        const totalCost = 0;

        // Expiring in 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringSoon = licenses.filter(l =>
            l.expiryDate && new Date(l.expiryDate) <= thirtyDaysFromNow && new Date(l.expiryDate) >= new Date()
        ).length;

        return {
            status: true,
            data: {
                totalLicenses: total, // now represents total assignments
                usedLicenses: used,
                totalCost: totalCost,
                expiringSoon: expiringSoon
            }
        };
    }

    async create(data: any) {
        const license = this.repo.create(data);
        const saved = await this.repo.save(license);
        return { status: true, data: saved, message: 'License assigned successfully' };
    }

    async update(id: number, data: any) {
        await this.repo.update(id, data);
        const updated = await this.repo.findOne({ where: { id } });
        return { status: true, data: updated, message: 'License updated successfully' };
    }

    async remove(id: number) {
        await this.repo.delete(id);
        return { status: true, message: 'License removed successfully' };
    }
}
