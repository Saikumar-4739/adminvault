
export class GlobalResponse {
    status: boolean;
    code: number;
    message: string;
    constructor(status: boolean, code: number, message: string) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}