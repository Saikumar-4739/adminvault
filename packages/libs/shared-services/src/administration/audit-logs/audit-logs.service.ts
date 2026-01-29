import { AuditLogModel } from '@adminvault/shared-models';
import { AxiosInstance } from '../../axios-instance';

const API_URL = '/api/audit-logs';

export const getAuditLogs = async (): Promise<AuditLogModel[]> => {
    const response = await AxiosInstance.get(API_URL);
    return response.data.data;
};
