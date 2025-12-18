import { GlobalResponse } from '@adminvault/backend-utils';

/**
 * Model for creating a new login session
 */
export class CreateLoginSessionModel {
    userId: number;
    companyId: number;
    ipAddress: string;
    userAgent?: string;
    loginMethod?: string;
    sessionToken?: string;

    constructor(
        userId: number,
        companyId: number,
        ipAddress: string,
        userAgent?: string,
        loginMethod?: string,
        sessionToken?: string
    ) {
        this.userId = userId;
        this.companyId = companyId;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.loginMethod = loginMethod;
        this.sessionToken = sessionToken;
    }
}

/**
 * Response model for login session data
 */
export class LoginSessionResponseModel {
    id: number;
    userId: number;
    sessionToken: string;
    loginTimestamp: Date;
    logoutTimestamp?: Date;
    isActive: boolean;
    ipAddress: string;
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    loginMethod?: string;
    isSuspicious: boolean;

    constructor(
        id: number,
        userId: number,
        sessionToken: string,
        loginTimestamp: Date,
        isActive: boolean,
        ipAddress: string,
        isSuspicious: boolean,
        logoutTimestamp?: Date,
        country?: string,
        region?: string,
        city?: string,
        latitude?: number,
        longitude?: number,
        timezone?: string,
        deviceType?: string,
        browser?: string,
        os?: string,
        loginMethod?: string
    ) {
        this.id = id;
        this.userId = userId;
        this.sessionToken = sessionToken;
        this.loginTimestamp = loginTimestamp;
        this.logoutTimestamp = logoutTimestamp;
        this.isActive = isActive;
        this.ipAddress = ipAddress;
        this.country = country;
        this.region = region;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timezone = timezone;
        this.deviceType = deviceType;
        this.browser = browser;
        this.os = os;
        this.loginMethod = loginMethod;
        this.isSuspicious = isSuspicious;
    }
}

/**
 * Response model for user login history
 */
export class GetUserLoginHistoryModel extends GlobalResponse<LoginSessionResponseModel[]> {
    constructor(status: boolean, code: number, message: string, data?: LoginSessionResponseModel[]) {
        super(status, code, message, data);
    }
}

/**
 * Response model for active sessions
 */
export class GetActiveSessionsModel extends GlobalResponse<LoginSessionResponseModel[]> {
    constructor(status: boolean, code: number, message: string, data?: LoginSessionResponseModel[]) {
        super(status, code, message, data);
    }
}

/**
 * Model for logout session request
 */
export class LogoutSessionModel {
    sessionId: number;

    constructor(sessionId: number) {
        this.sessionId = sessionId;
    }
}
