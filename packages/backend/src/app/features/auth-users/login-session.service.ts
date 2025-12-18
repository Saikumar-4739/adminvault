import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import axios from 'axios';
import * as UAParser from 'ua-parser-js';
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
                    district: response.data.district || response.data.regionName,
                    latitude: response.data.lat,
                    longitude: response.data.lon,
                    timezone: response.data.timezone
                };
            }
        } catch (error) {
            console.error('Geolocation API error:', error);
        }
        return null;
    }

    /**
     * Reverse geocode GPS coordinates to get address using Google Geocoding API
     * @param latitude - GPS latitude
     * @param longitude - GPS longitude
     */
    private async reverseGeocode(latitude: number, longitude: number) {
        try {
            // Google Geocoding API endpoint
            const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;

            if (!apiKey) {
                console.warn('Google Geocoding API key not configured');
                return null;
            }

            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
            const response = await axios.get(url, { timeout: 5000 });
            console.log(response.data, 'response.data');

            if (response.data.status === 'OK' && response.data.results.length > 0) {
                const result = response.data.results[0];
                const addressComponents = result.address_components;

                // Extract location components
                let city = null;
                let district = null;
                let region = null;
                let country = null;

                for (const component of addressComponents) {
                    const types = component.types;

                    if (types.includes('locality')) {
                        city = component.long_name;
                    } else if (types.includes('administrative_area_level_3')) {
                        district = component.long_name;
                    } else if (types.includes('administrative_area_level_2') && !district) {
                        district = component.long_name;
                    } else if (types.includes('administrative_area_level_1')) {
                        region = component.long_name;
                    } else if (types.includes('country')) {
                        country = component.long_name;
                    }
                }

                return {
                    country,
                    region,
                    city,
                    district,
                    formattedAddress: result.formatted_address
                };
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
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

        const parser = new UAParser.UAParser(userAgent);
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
            console.log('=== LOGIN SESSION DEBUG ===');
            console.log('Request has GPS:', !!reqModel.latitude && !!reqModel.longitude);
            console.log('GPS Coordinates:', { lat: reqModel.latitude, lng: reqModel.longitude });
            console.log('IP Address:', reqModel.ipAddress);

            let locationData = null;
            let usesFrontendLocation = false;

            // Check if frontend provided exact GPS coordinates
            if (reqModel.latitude && reqModel.longitude) {
                usesFrontendLocation = true;
                console.log('✅ Using frontend GPS coordinates');

                // Use Google Geocoding API to get address from GPS coordinates
                console.log('Calling Google Geocoding API...');
                locationData = await this.reverseGeocode(reqModel.latitude, reqModel.longitude);

                if (locationData) {
                    console.log('✅ Google Geocoding successful:', locationData);
                } else {
                    console.warn('❌ Reverse geocoding failed, falling back to IP-based location');
                    locationData = await this.getLocationFromIP(reqModel.ipAddress);
                }
            } else {
                console.log('⚠️ No GPS coordinates from frontend, using IP-based location');
                // Fallback to IP-based geolocation
                locationData = await this.getLocationFromIP(reqModel.ipAddress);

                if (locationData) {
                    console.log('✅ IP-based location:', locationData);
                } else {
                    console.log('❌ IP-based location failed (likely localhost)');
                }
            }

            // Parse user agent
            const deviceInfo = this.parseUserAgent(reqModel.userAgent || '');

            await transManager.startTransaction();

            const session = new UserLoginSessionEntity();
            session.userId = reqModel.userId;
            session.companyId = reqModel.companyId;
            session.ipAddress = reqModel.ipAddress;
            session.sessionToken = reqModel.sessionToken || this.generateSessionToken();
            session.loginTimestamp = new Date();
            session.isActive = true;
            session.userAgent = reqModel.userAgent || '';
            session.loginMethod = reqModel.loginMethod || 'email_password';

            // Prioritize frontend GPS coordinates
            if (usesFrontendLocation) {
                session.latitude = reqModel.latitude ?? null;
                session.longitude = reqModel.longitude ?? null;
                console.log('Storing GPS coordinates:', { lat: session.latitude, lng: session.longitude });
            } else if (locationData && 'latitude' in locationData) {
                // Only use lat/lng from IP-based lookup
                session.latitude = locationData.latitude;
                session.longitude = locationData.longitude;
                console.log('Storing IP-based coordinates:', { lat: session.latitude, lng: session.longitude });
            }

            // Add location data if available from reverse geocoding or IP lookup
            if (locationData) {
                session.country = locationData.country;
                session.region = locationData.region;
                session.city = locationData.city;
                session.district = locationData.district;
                session.timezone = ('timezone' in locationData) ? locationData.timezone : null;
                console.log('Location data stored:', {
                    country: session.country,
                    region: session.region,
                    city: session.city,
                    district: session.district
                });
            } else {
                console.log('⚠️ No location data available');
            }

            // Add device info
            session.browser = deviceInfo.browser || '';
            session.os = deviceInfo.os || '';
            session.deviceType = deviceInfo.deviceType || 'Desktop';

            // Check for suspicious activity
            session.isSuspicious = await this.detectSuspiciousActivity(reqModel.userId, reqModel.ipAddress, locationData?.country);

            await transManager.getRepository(UserLoginSessionEntity).save(session);
            await transManager.completeTransaction();

            console.log('=== SESSION SAVED SUCCESSFULLY ===\n');
            return new GlobalResponse(true, 0, "Login session created successfully");
        } catch (error) {
            console.error('❌ ERROR in createLoginSession:', error);
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
            session.district ?? undefined,
            session.latitude ?? undefined,
            session.longitude ?? undefined,
            session.timezone,
            session.deviceType,
            session.browser,
            session.os,
            session.loginMethod
        );
    }

    /**
     * Create a failed login attempt record
     */
    async createFailedLoginAttempt(data: {
        userId: number;
        companyId: number;
        ipAddress: string;
        userAgent?: string;
        loginMethod?: string;
        failureReason: string;
        attemptedEmail?: string;
        latitude?: number;
        longitude?: number;
    }): Promise<void> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            console.log('📝 Recording failed login attempt with GPS:', {
                hasGPS: !!data.latitude && !!data.longitude,
                lat: data.latitude,
                lng: data.longitude
            });

            // Get location data from IP (or use GPS if provided)
            let locationData = null;
            if (data.latitude && data.longitude) {
                // Use Google Geocoding API to get address from GPS coordinates
                locationData = await this.reverseGeocode(data.latitude, data.longitude);

                if (!locationData) {
                    // Fallback to IP-based location
                    locationData = await this.getLocationFromIP(data.ipAddress);
                }
            } else {
                // Use IP-based geolocation
                locationData = await this.getLocationFromIP(data.ipAddress);
            }

            // Parse user agent
            const deviceInfo = this.parseUserAgent(data.userAgent || '');

            await transManager.startTransaction();

            const session = new UserLoginSessionEntity();
            session.userId = data.userId;
            session.companyId = data.companyId;
            session.ipAddress = data.ipAddress;
            session.sessionToken = `failed_${Date.now()}`;
            session.loginTimestamp = new Date();
            session.isActive = false; // Failed login is not active
            session.logoutTimestamp = new Date(); // Immediately mark as logged out
            session.userAgent = data.userAgent || '';
            session.loginMethod = data.loginMethod || 'email_password';
            session.failedAttempts = 1;

            // Store GPS coordinates if provided
            if (data.latitude && data.longitude) {
                session.latitude = data.latitude;
                session.longitude = data.longitude;
                console.log('✅ Storing GPS coordinates for failed login:', {
                    lat: session.latitude,
                    lng: session.longitude
                });
            } else if (locationData && 'latitude' in locationData) {
                session.latitude = locationData.latitude;
                session.longitude = locationData.longitude;
            }

            // Add location data if available
            if (locationData) {
                session.country = locationData.country;
                session.region = locationData.region;
                session.city = locationData.city;
                session.district = locationData.district;
                session.timezone = ('timezone' in locationData) ? locationData.timezone : null;

                console.log('✅ Location data for failed login:', {
                    country: session.country,
                    city: session.city,
                    district: session.district
                });
            }

            // Add device info
            session.browser = deviceInfo.browser || '';
            session.os = deviceInfo.os || '';
            session.deviceType = deviceInfo.deviceType || 'Desktop';

            // Mark as suspicious if multiple failed attempts from same IP
            session.isSuspicious = await this.detectSuspiciousFailedAttempts(data.ipAddress);

            await transManager.getRepository(UserLoginSessionEntity).save(session);
            await transManager.completeTransaction();

            console.log('✅ Failed login attempt recorded\n');
        } catch (error) {
            await transManager.releaseTransaction();
            console.error('Error creating failed login attempt:', error);
        }
    }

    /**
     * Detect suspicious failed login attempts from same IP
     */
    private async detectSuspiciousFailedAttempts(ipAddress: string): Promise<boolean> {
        try {
            // Get recent failed attempts from this IP (last 30 minutes)
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            const recentFailedAttempts = await this.loginSessionRepo.find({
                where: {
                    ipAddress,
                    isActive: false,
                    failedAttempts: 1
                },
                order: { loginTimestamp: 'DESC' },
                take: 10
            });

            const recentFailed = recentFailedAttempts.filter(s => s.loginTimestamp > thirtyMinutesAgo);

            // More than 3 failed attempts in 30 minutes is suspicious
            return recentFailed.length >= 3;
        } catch (error) {
            console.error('Error detecting suspicious failed attempts:', error);
            return false;
        }
    }
}
