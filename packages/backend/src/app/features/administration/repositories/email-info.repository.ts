import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { EmailInfoEntity } from '../entities/email-info.entity';

@Injectable()
export class EmailInfoRepository extends Repository<EmailInfoEntity> {
    constructor(private dataSource: DataSource) {
        super(EmailInfoEntity, dataSource.createEntityManager());
    }

    async getEmailsWithEmployee(companyId?: number): Promise<any[]> {
        const query = this.createQueryBuilder('email')
            .leftJoinAndSelect('employees', 'emp', 'emp.id = email.employee_id')
            .select([
                'email.id as id',
                'email.company_id as company_id',
                'email.email_type as email_type',
                'email.department as department',
                'email.email as email',
                'email.employee_id as employee_id',
                'CONCAT(emp.first_name, " ", emp.last_name) as employee_name'
            ]);

        if (companyId) {
            query.where('email.company_id = :companyId', { companyId });
        }

        return await query.getRawMany();
    }

    async getEmailStatsByCompany(companyId: number): Promise<any> {
        const byType = await this.createQueryBuilder('email')
            .select('email.email_type as type, COUNT(*) as count')
            .where('email.company_id = :companyId', { companyId })
            .groupBy('email.email_type')
            .getRawMany();

        const byStatus = await this.createQueryBuilder('email')
            .select('email.status as status, COUNT(*) as count')
            .where('email.company_id = :companyId', { companyId })
            .groupBy('email.status')
            .getRawMany();

        return { byType, byStatus };
    }
}
