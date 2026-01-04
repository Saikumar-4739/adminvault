import { GlobalResponse } from '../common/global-response';

export class BulkImportRequestModel {
    fileBuffer: any;
    companyId: number;
    userId: number;
    constructor(fileBuffer: any, companyId: number, userId: number) {
        this.fileBuffer = fileBuffer;
        this.companyId = companyId;
        this.userId = userId;
    }
}

export class BulkImportResponseModel extends GlobalResponse {
    successCount: number;
    errorCount: number;
    errors: { row: number; error: string }[];

    constructor(
        status: boolean,
        code: number,
        message: string,
        successCount: number,
        errorCount: number,
        errors: { row: number; error: string }[]
    ) {
        super(status, code, message);
        this.successCount = successCount;
        this.errorCount = errorCount;
        this.errors = errors;
    }
}
