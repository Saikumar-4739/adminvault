import { POStatusEnum } from '../enums';
import { GlobalResponse } from '../common/global-response';

// ============================================
// PO ITEM MODELS
// ============================================

export class POItemModel {
    itemName: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    assetTypeId?: number;

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

// ============================================
// REQUEST MODELS - CREATE
// ============================================

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

// ============================================
// REQUEST MODELS - UPDATE
// ============================================

export class UpdatePOModel {
    id: number;
    vendorId: number;
    orderDate: Date;
    expectedDeliveryDate?: Date;
    status: POStatusEnum;
    items: POItemModel[];
    notes?: string;
    timeSpentMinutes?: number;

    constructor(
        id: number,
        vendorId: number,
        orderDate: Date,
        status: POStatusEnum,
        items: POItemModel[],
        expectedDeliveryDate?: Date,
        notes?: string,
        timeSpentMinutes?: number
    ) {
        this.id = id;
        this.vendorId = vendorId;
        this.orderDate = orderDate;
        this.status = status;
        this.items = items;
        this.expectedDeliveryDate = expectedDeliveryDate;
        this.notes = notes;
        this.timeSpentMinutes = timeSpentMinutes;
    }
}

// ============================================
// REQUEST MODELS - GET/DELETE
// ============================================

export class GetAllPOsRequestModel {
    companyId: number;

    constructor(companyId: number) {
        this.companyId = companyId;
    }
}

export class GetPORequestModel {
    id: number;

    constructor(id: number) {
        this.id = id;
    }
}

export class DeletePORequestModel {
    id: number;

    constructor(id: number) {
        this.id = id;
    }
}

export class UpdatePOStatusRequestModel {
    id: number;
    status: POStatusEnum;

    constructor(id: number, status: POStatusEnum) {
        this.id = id;
        this.status = status;
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

// ============================================
// DATA MODELS
// ============================================

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

// ============================================
// RESPONSE MODELS
// ============================================

export class CreatePOResponseModel extends GlobalResponse {
    po: PurchaseOrderModel;

    constructor(status: boolean, code: number, message: string, po: PurchaseOrderModel) {
        super(status, code, message);
        this.po = po;
    }
}

export class UpdatePOResponseModel extends GlobalResponse {
    po: PurchaseOrderModel;

    constructor(status: boolean, code: number, message: string, po: PurchaseOrderModel) {
        super(status, code, message);
        this.po = po;
    }
}

export class GetAllPOsModel extends GlobalResponse {
    pos: PurchaseOrderModel[];

    constructor(status: boolean, code: number, message: string, pos: PurchaseOrderModel[]) {
        super(status, code, message);
        this.pos = pos;
    }
}

export class GetPOByIdModel extends GlobalResponse {
    po: PurchaseOrderModel;

    constructor(status: boolean, code: number, message: string, po: PurchaseOrderModel) {
        super(status, code, message);
        this.po = po;
    }
}
