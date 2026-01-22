import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { PurchaseOrderItemEntity } from "../entities/purchase-order-item.entity";

@Injectable()
export class PurchaseOrderItemRepository extends Repository<PurchaseOrderItemEntity> {
    constructor(private dataSource: DataSource) {
        super(PurchaseOrderItemEntity, dataSource.createEntityManager());
    }
}
