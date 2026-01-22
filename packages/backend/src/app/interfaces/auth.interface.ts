import { Request } from 'express';

export interface IUserPayload {
    userId: number;
    email: string;
    companyId: number;
}

export interface IAuthenticatedRequest extends Request {
    user: IUserPayload;
}
