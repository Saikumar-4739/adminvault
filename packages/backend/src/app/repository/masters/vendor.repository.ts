import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { VendorEntity } from "../../entities/masters/vendor.entity";

@Injectable()
export class VendorRepository extends Repository<VendorEntity> {
    constructor(private dataSource: DataSource) {
        super(VendorEntity, dataSource.createEntityManager());
    }
}
