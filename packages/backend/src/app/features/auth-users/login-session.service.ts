import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import axios from 'axios';
import UAParser from 'ua-parser-js';
import { UserLoginSessionRepository } from '../../repository/user-login-session.repository';
import { UserLoginSessionEntity } from '../../entities/user-login-sessions.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import {
    CreateLoginSessionModel,
    LoginSessionResponseModel,
    GetUserLoginHistoryModel,
    GetActiveSessionsModel,
    LogoutSessionModel
} from '@adminvault/shared-models';

/**
 * Service for managing user login sessions
 * Tracks IP addresses, locations, device info, and session status
 */
@Injectable()
export class LoginSessionService {
    constructor(
        private dataSource: DataSource,
        private loginSessionRepo: UserLoginSessionRepository
    ) { }

    /**
     * Get geolocation data from IP address using ip-api.com
     */
    private async getLocationFromIP(ipAddress: string) {
        try {
            // Skip for localhost/private IPs
            if (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress.startsWith('192.168.')) {
                return null;
            }

            const response = await axios.get(`http://ip-api.com/json/${ipAddress}`, {
                timeout: 5000
            });

            if (response.data.status === 'success') {
                return {
                    country: response.data.country,
                    region: response.data.regionName,
                    city: response.data.city,
                    latitude: response.data.lat,
                    longitude: response.data.lon,
                    timezone: response.data.timezone
                };
            }
        } catch (error) {
            console.error('Geolocation API error:', error.message);
        }
        return null;
    }

    /**
     * Parse user agent string to extract device information
     */
    private parseUserAgent(userAgent: string) {
        if (!userAgent) {
            return { browser: null, os: null, deviceType: null };
        }

        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        return {
            browser: result.browser.name ? `${result.browser.name} ${result.browser.version || ''}`.trim() : null,
            os: result.os.name ? `${result.os.name} ${result.os.version || ''}`.trim() : null,
            deviceType: result.device.type || 'Desktop'
        };
    }

    /**
     * Create a new login session record
     */
    async createLoginSession(reqModel: CreateLoginSessionModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            // Get location data from IP
            const locationData = await this.getLocationFromIP(reqModel.ipAddress);

            // Parse user agent
            const deviceInfo = this.parseUserAgent(reqModel.userAgent);

            await transManager.startTransaction();

            const session = new UserLoginSessionEntity();
            session.userId = reqModel.userId;
            session.companyId = reqModel.companyId;
            session.ipAddress = reqModel.ipAddress;
            session.sessionToken = reqModel.sessionToken || this.generateSessionToken();
            session.loginTimestamp = new Date();
            session.isActive = true;
            session.userAgent = reqModel.userAgent;
            session.loginMethod = reqModel.loginMethod || 'email_password';

            // Add location data if available
            if (locationData) {
                session.country = locationData.country;
                session.region = locationData.region;
                session.city = locationData.city;
                session.latitude = locationData.latitude;
                session.longitude = locationData.longitude;
                session.timezone = locationData.timezone;
            }

            // Add device info
            session.browser = deviceInfo.browser;
            session.os = deviceInfo.os;
            session.deviceType = deviceInfo.deviceType;

            // Check for suspicious activity
            session.isSuspicious = await this.detectSuspiciousActivity(reqModel.userId, reqModel.ipAddress, locationData?.country);

            await transManager.getRepository(UserLoginSessionEntity).save(session);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 0, "Login session created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Get user login history
     */
    async getUserLoginHistory(userId: number, limit: number = 50): Promise<GetUserLoginHistoryModel> {
        try {
            const sessions = await this.loginSessionRepo.getUserLoginHistory(userId, limit);
            const responses = sessions.map(s => this.mapToResponseModel(s));
            return new GetUserLoginHistoryModel(true, 0, "Login history retrieved successfully", responses);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get active sessions for a user
     */
    async getActiveSessions(userId: number): Promise<GetActiveSessionsModel> {
        try {
            const sessions = await this.loginSessionRepo.getActiveSessions(userId);
            const responses = sessions.map(s => this.mapToResponseModel(s));
            return new GetActiveSessionsModel(true, 0, "Active sessions retrieved successfully", responses);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Logout a specific session
     */
    async logoutSession(reqModel: LogoutSessionModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const session = await this.loginSessionRepo.findOne({ where: { id: reqModel.sessionId } });
            if (!session) {
                throw new ErrorResponse(0, "Session not found");
            }

            await transManager.startTransaction();
            await transManager.getRepository(UserLoginSessionEntity).update(
                reqModel.sessionId,
                { isActive: false, logoutTimestamp: new Date() }
            );
            await transManager.completeTransaction();

            return new GlobalResponse(true, 0, "Session logged out successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Logout all sessions for a user
     */
    async logoutAllSessions(userId: number): Promise<GlobalResponse> {
        try {
            await this.loginSessionRepo.deactivateAllUserSessions(userId);
            return new GlobalResponse(true, 0, "All sessions logged out successfully");
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get suspicious logins for a company (Admin only)
     */
    async getSuspiciousLogins(companyId: number): Promise<GetUserLoginHistoryModel> {
        try {
            const sessions = await this.loginSessionRepo.getSuspiciousLogins(companyId);
            const responses = sessions.map(s => this.mapToResponseModel(s));
            return new GetUserLoginHistoryModel(true, 0, "Suspicious logins retrieved successfully", responses);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Detect suspicious login activity
     */
    private async detectSuspiciousActivity(userId: number, ipAddress: string, country: string): Promise<boolean> {
        try {
            // Get recent logins (last 24 hours)
            const recentSessions = await this.loginSessionRepo.find({
                where: { userId },
                order: { loginTimestamp: 'DESC' },
                take: 10
            });

            if (recentSessions.length === 0) {
                return false; // First login, not suspicious
            }

            // Check for login from different country within 1 hour
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const recentDifferentCountry = recentSessions.find(s =>
                s.loginTimestamp > oneHourAgo &&
                s.country &&
                country &&
                s.country !== country
            );

            if (recentDifferentCountry) {
                return true; // Login from different country too quickly
            }

            // Check for too many logins in short time
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const recentLogins = recentSessions.filter(s => s.loginTimestamp > fiveMinutesAgo);
            if (recentLogins.length > 5) {
                return true; // Too many login attempts
            }

            return false;
        } catch (error) {
            console.error('Error detecting suspicious activity:', error);
            return false;
        }
    }

    /**
     * Generate a unique session token
     */
    private generateSessionToken(): string {
        return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Map entity to response model
     */
    private mapToResponseModel(session: UserLoginSessionEntity): LoginSessionResponseModel {
        return new LoginSessionResponseModel(
            session.id,
            session.userId,
            session.sessionToken,
            session.loginTimestamp,
            session.isActive,
            session.ipAddress,
            session.isSuspicious,
            session.logoutTimestamp,
            session.country,
            session.region,
            session.city,
            session.latitude,
            session.longitude,
            session.timezone,
            session.deviceType,
            session.browser,
            session.os,
            session.loginMethod
        );
    }
}
