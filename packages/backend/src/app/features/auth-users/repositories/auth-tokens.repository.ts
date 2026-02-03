import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AuthTokensEntity } from "../entities/auth-tokens.entity";

@Injectable()
export class AuthTokensRepository extends Repository<AuthTokensEntity> {
    constructor(private dataSource: DataSource) {
        super(AuthTokensEntity, dataSource.createEntityManager());
    }

    async revokeAllTokensForUser(userId: number): Promise<void> {
        await this.update({ userId }, { isRevoked: true });
    }

    async revokeToken(token: string): Promise<void> {
        await this.update({ token }, { isRevoked: true });
    }
}
