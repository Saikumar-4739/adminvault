import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { DepartmentEntity } from "../../entities/masters/department.entity";
import { DesignationEntity } from "../../entities/masters/designation.entity";
import { AssetTypeEntity } from "../../entities/masters/asset-type.entity";
import { BrandEntity } from "../../entities/masters/brand.entity";
import { VendorEntity } from "../../entities/masters/vendor.entity";
import { LocationEntity } from "../../entities/masters/location.entity";
import { TicketCategoryEntity } from "../../entities/masters/ticket-category.entity";

@Injectable()
export class DepartmentRepository extends Repository<DepartmentEntity> {
    constructor(private dataSource: DataSource) {
        super(DepartmentEntity, dataSource.createEntityManager());
    }
}

@Injectable()
export class DesignationRepository extends Repository<DesignationEntity> {
    constructor(private dataSource: DataSource) {
        super(DesignationEntity, dataSource.createEntityManager());
    }
}

@Injectable()
export class AssetTypeRepository extends Repository<AssetTypeEntity> {
    constructor(private dataSource: DataSource) {
        super(AssetTypeEntity, dataSource.createEntityManager());
    }
}

@Injectable()
export class BrandRepository extends Repository<BrandEntity> {
    constructor(private dataSource: DataSource) {
        super(BrandEntity, dataSource.createEntityManager());
    }
}

@Injectable()
export class VendorRepository extends Repository<VendorEntity> {
    constructor(private dataSource: DataSource) {
        super(VendorEntity, dataSource.createEntityManager());
    }
}

@Injectable()
export class LocationRepository extends Repository<LocationEntity> {
    constructor(private dataSource: DataSource) {
        super(LocationEntity, dataSource.createEntityManager());
    }
}

@Injectable()
export class TicketCategoryRepository extends Repository<TicketCategoryEntity> {
    constructor(private dataSource: DataSource) {
        super(TicketCategoryEntity, dataSource.createEntityManager());
    }
}
