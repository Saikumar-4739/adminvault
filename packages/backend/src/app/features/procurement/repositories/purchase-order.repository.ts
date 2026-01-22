import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { PurchaseOrderEntity } from "../entities/purchase-order.entity";

@Injectable()
export class PurchaseOrderRepository extends Repository<PurchaseOrderEntity> {
    constructor(private dataSource: DataSource) {
        super(PurchaseOrderEntity, dataSource.createEntityManager());
    }
}
