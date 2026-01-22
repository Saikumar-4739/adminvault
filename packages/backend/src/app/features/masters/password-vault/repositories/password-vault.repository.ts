import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { PasswordVaultMasterEntity } from "../entities/password-vault.entity";

@Injectable()
export class PasswordVaultRepository extends Repository<PasswordVaultMasterEntity> {
    constructor(private dataSource: DataSource) {
        super(PasswordVaultMasterEntity, dataSource.createEntityManager());
    }
}
