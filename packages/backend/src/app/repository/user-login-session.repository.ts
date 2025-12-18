import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { UserLoginSessionEntity } from "../entities/user-login-sessions.entity";

/**
 * Repository for user login session operations
 */
@Injectable()
export class UserLoginSessionRepository extends Repository<UserLoginSessionEntity> {
    constructor(private dataSource: DataSource) {
        super(UserLoginSessionEntity, dataSource.createEntityManager());
    }

    /**
     * Get active sessions for a user
     */
    async getActiveSessions(userId: number) {
        return await this.find({
            where: { userId, isActive: true },
            order: { loginTimestamp: 'DESC' }
        });
    }

    /**
     * Get login history for a user with pagination
     */
    async getUserLoginHistory(userId: number, limit: number = 50) {
        return await this.find({
            where: { userId },
            order: { loginTimestamp: 'DESC' },
            take: limit
        });
    }

    /**
     * Get suspicious login attempts
     */
    async getSuspiciousLogins(companyId: number) {
        return await this.find({
            where: { companyId, isSuspicious: true },
            order: { loginTimestamp: 'DESC' },
            take: 100
        });
    }

    /**
     * Deactivate all sessions for a user (logout all devices)
     */
    async deactivateAllUserSessions(userId: number) {
        return await this.update(
            { userId, isActive: true },
            { isActive: false, logoutTimestamp: new Date() }
        );
    }
}
