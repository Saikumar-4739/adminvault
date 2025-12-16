import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AuthUsersEntity } from "../entities/auth-users.entity";

@Injectable()
export class AuthUsersRepository extends Repository<AuthUsersEntity> {
    constructor(private dataSource: DataSource) {
        super(AuthUsersEntity, dataSource.createEntityManager());
    }
}
