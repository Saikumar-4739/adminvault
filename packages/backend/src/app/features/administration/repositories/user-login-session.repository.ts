import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserLoginSessionsEntity } from '../entities/user-login-sessions.entity';

@Injectable()
export class UserLoginSessionRepository extends Repository<UserLoginSessionsEntity> {
    constructor(private dataSource: DataSource) {
        super(UserLoginSessionsEntity, dataSource.createEntityManager());
    }

    async getUserLoginHistory(userId: number, limit = 50): Promise<UserLoginSessionsEntity[]> {
        return await this.find({
            where: { userId },
            order: { loginTimestamp: 'DESC' },
            take: limit
        });
    }

    async getActiveSessions(userId: number): Promise<UserLoginSessionsEntity[]> {
        return await this.find({
            where: { userId, isActive: true },
            order: { loginTimestamp: 'DESC' }
        });
    }

    async deactivateAllUserSessions(userId: number): Promise<void> {
        await this.update(
            { userId, isActive: true },
            { isActive: false, logoutTimestamp: new Date() }
        );
    }

    async getSuspiciousLogins(): Promise<UserLoginSessionsEntity[]> {
        return await this.find({
            where: { isSuspicious: true },
            order: { loginTimestamp: 'DESC' },
            take: 100
        });
    }
}
