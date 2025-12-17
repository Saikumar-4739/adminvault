export class GlobalResponse<T = any> {
    status: boolean;
    code: number;
    message: string;
    data?: T;
    constructor(status: boolean, code: number, message: string, data?: T) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.data = data;
    }
}