import { POStatusEnum } from '../enums';
import { GlobalResponse } from '../common/global-response';

// --- PO Item Models ---

// --- PO Item Models ---

export class POItemModel {
    itemName: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    assetTypeId?: number; // Optional link to Asset Type for auto-conversion

    constructor(
        itemName: string,
        quantity: number,
        unitPrice: number,
        sku?: string,
        assetTypeId?: number
    ) {
        this.itemName = itemName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = quantity * unitPrice;
        this.sku = sku;
        this.assetTypeId = assetTypeId;
    }
}

// --- PO Models ---

export class CreatePOModel {
    vendorId: number;
    orderDate: Date;
    expectedDeliveryDate?: Date;
    items: POItemModel[];
    notes?: string;
    timeSpentMinutes?: number;

    constructor(
        vendorId: number,
        orderDate: Date,
        items: POItemModel[],
        expectedDeliveryDate?: Date,
        notes?: string,
        timeSpentMinutes?: number
    ) {
        this.vendorId = vendorId;
        this.orderDate = orderDate;
        this.items = items;
        this.expectedDeliveryDate = expectedDeliveryDate;
        this.notes = notes;
        this.timeSpentMinutes = timeSpentMinutes;
    }
}

export class PurchaseOrderModel {
    id: number;
    poNumber: string;
    vendorId: number;
    vendorName?: string;
    requesterId: number;
    requesterName?: string;
    orderDate: Date;
    expectedDeliveryDate?: Date;
    status: POStatusEnum;
    totalAmount: number;
    items?: POItemModel[];
    notes?: string;
    timeSpentMinutes?: number;
    createdAt: Date;

    constructor(
        id: number,
        poNumber: string,
        vendorId: number,
        requesterId: number,
        orderDate: Date,
        status: POStatusEnum,
        totalAmount: number,
        createdAt: Date,
        items?: POItemModel[],
        vendorName?: string,
        requesterName?: string,
        expectedDeliveryDate?: Date,
        notes?: string,
        timeSpentMinutes?: number
    ) {
        this.id = id;
        this.poNumber = poNumber;
        this.vendorId = vendorId;
        this.requesterId = requesterId;
        this.orderDate = orderDate;
        this.status = status;
        this.totalAmount = totalAmount;
        this.createdAt = createdAt;
        this.items = items;
        this.vendorName = vendorName;
        this.requesterName = requesterName;
        this.expectedDeliveryDate = expectedDeliveryDate;
        this.notes = notes;
        this.timeSpentMinutes = timeSpentMinutes;
    }
}

export class GetAllPOsModel extends GlobalResponse {
    pos: PurchaseOrderModel[];
    constructor(status: boolean, code: number, message: string, pos: PurchaseOrderModel[]) {
        super(status, code, message, pos);
        this.pos = pos;
    }
}

export class GetPOByIdModel extends GlobalResponse {
    po: PurchaseOrderModel;
    constructor(status: boolean, code: number, message: string, po: PurchaseOrderModel) {
        super(status, code, message, po);
        this.po = po;
    }
}

export class SearchPOModel {
    companyId: number;
    query?: string;
    status?: POStatusEnum;

    constructor(companyId: number, query?: string, status?: POStatusEnum) {
        this.companyId = companyId;
        this.query = query;
        this.status = status;
    }
}
