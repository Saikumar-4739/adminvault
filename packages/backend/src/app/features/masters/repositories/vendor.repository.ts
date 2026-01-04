import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { VendorsMasterEntity } from "../../entities/masters/vendor.entity";

@Injectable()
export class VendorRepository extends Repository<VendorsMasterEntity> {
    constructor(private dataSource: DataSource) {
        super(VendorsMasterEntity, dataSource.createEntityManager());
    }
}
