import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { UserLoginSessionsEntity } from "../entities/user-login-sessions.entity";

@Injectable()
export class UserLoginSessionRepository extends Repository<UserLoginSessionsEntity> {
    constructor(private dataSource: DataSource) {
        super(UserLoginSessionsEntity, dataSource.createEntityManager());
    }

    async getActiveSessions(userId: number) {
        return await this.find({ where: { userId, isActive: true }, order: { loginTimestamp: 'DESC' } });
    }

    async getUserLoginHistory(userId: number, limit: number = 50) {
        return await this.find({ where: { userId }, order: { loginTimestamp: 'DESC' }, take: limit });
    }

    async getSuspiciousLogins() {
        return await this.find({ where: { isSuspicious: true }, order: { loginTimestamp: 'DESC' }, take: 100 });
    }

    async deactivateAllUserSessions(userId: number) {
        return await this.update({ userId, isActive: true }, { isActive: false, logoutTimestamp: new Date() });
    }
}
