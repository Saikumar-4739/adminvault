import { Column, Entity } from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';

/**
 * Entity for tracking user login sessions
 * Records IP addresses, locations, device info, and session status
 */
@Entity('user_login_sessions')
export class UserLoginSessionEntity extends CommonBaseEntity {
    @Column('varchar', { name: 'session_token', length: 255, unique: true, nullable: true, comment: 'Unique session identifier' })
    sessionToken: string;

    @Column('timestamp', { name: 'login_timestamp', default: () => 'CURRENT_TIMESTAMP', comment: 'When user logged in' })
    loginTimestamp: Date;

    @Column('timestamp', { name: 'logout_timestamp', nullable: true, comment: 'When user logged out' })
    logoutTimestamp: Date;

    @Column('boolean', { name: 'is_active', default: true, comment: 'Whether session is currently active' })
    isActive: boolean;

    // IP & Location Information
    @Column('varchar', { name: 'ip_address', length: 45, nullable: false, comment: 'User IP address (IPv4/IPv6)' })
    ipAddress: string;

    @Column('varchar', { name: 'country', length: 100, nullable: true, comment: 'Country name' })
    country: string;

    @Column('varchar', { name: 'region', length: 100, nullable: true, comment: 'State/Region name' })
    region: string;

    @Column('varchar', { name: 'city', length: 100, nullable: true, comment: 'City name' })
    city: string;

    @Column('varchar', { name: 'district', length: 100, nullable: true, comment: 'District/County name' })
    district: string | null;

    @Column('decimal', { name: 'latitude', precision: 10, scale: 8, nullable: true, comment: 'Latitude coordinate' })
    latitude: number | null;

    @Column('decimal', { name: 'longitude', precision: 11, scale: 8, nullable: true, comment: 'Longitude coordinate' })
    longitude: number | null;

    @Column('varchar', { name: 'timezone', length: 50, nullable: true, comment: 'Timezone identifier' })
    timezone: string;

    // Device & Browser Information
    @Column('text', { name: 'user_agent', nullable: true, comment: 'Full user agent string' })
    userAgent: string;

    @Column('varchar', { name: 'device_type', length: 50, nullable: true, comment: 'Desktop, Mobile, Tablet' })
    deviceType: string;

    @Column('varchar', { name: 'browser', length: 100, nullable: true, comment: 'Browser name and version' })
    browser: string;

    @Column('varchar', { name: 'os', length: 100, nullable: true, comment: 'Operating system' })
    os: string;

    // Security & Audit
    @Column('varchar', { name: 'login_method', length: 50, nullable: true, comment: 'Authentication method used' })
    loginMethod: string;

    @Column('boolean', { name: 'is_suspicious', default: false, comment: 'Flagged as suspicious activity' })
    isSuspicious: boolean;

    @Column('int', { name: 'failed_attempts', default: 0, comment: 'Number of failed login attempts' })
    failedAttempts: number;
}
