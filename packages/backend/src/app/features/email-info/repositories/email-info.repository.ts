import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { EmailInfoEntity } from "../entities/email-info.entity";

@Injectable()
export class EmailInfoRepository extends Repository<EmailInfoEntity> {
    constructor(private dataSource: DataSource) {
        super(EmailInfoEntity, dataSource.createEntityManager());
    }

    async getEmailsWithEmployee(companyId?: number) {
        const query = this.createQueryBuilder('email_info')
            .leftJoin('employees', 'emp', 'emp.id = email_info.employee_id')
            .select([
                'email_info.id as id',
                'email_info.email as email',
                'email_info.email_type as email_type',
                'email_info.department as department',
                'email_info.status as status',
                'email_info.company_id as company_id',
                'emp.first_name as first_name',
                'emp.last_name as last_name',
                'emp.id as employee_id'
            ]);
        if (companyId) query.where('email_info.company_id = :companyId', { companyId });
        return query.getRawMany();
    }

    async getEmailStatsByCompany(companyId: number) {
        const byType = await this.createQueryBuilder('email_info')
            .select('email_info.email_type', 'type')
            .addSelect('COUNT(email_info.id)', 'count')
            .where('email_info.company_id = :companyId', { companyId })
            .groupBy('email_info.email_type')
            .getRawMany();

        const byStatus = await this.createQueryBuilder('email_info')
            .select('email_info.status', 'status')
            .addSelect('COUNT(email_info.id)', 'count')
            .where('email_info.company_id = :companyId', { companyId })
            .groupBy('email_info.status')
            .getRawMany();

        return { byType, byStatus };
    }
}
