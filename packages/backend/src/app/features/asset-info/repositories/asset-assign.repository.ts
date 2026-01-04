import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AssetAssignEntity } from "../entities/asset-assign.entity";

@Injectable()
export class AssetAssignRepository extends Repository<AssetAssignEntity> {
    constructor(private dataSource: DataSource) {
        super(AssetAssignEntity, dataSource.createEntityManager());
    }

    async getAllAssignments(companyId?: number) {
        const query = this.createQueryBuilder('assign');
        if (companyId) {
            query.where('assign.company_id = :companyId', { companyId });
        }
        return await query.orderBy('assign.created_at', 'DESC').getMany();
    }
}
