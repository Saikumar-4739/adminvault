import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { CredentialVaultEntity } from "../entities/credential-vault.entity";

@Injectable()
export class CredentialVaultRepository extends Repository<CredentialVaultEntity> {
    constructor(private dataSource: DataSource) {
        super(CredentialVaultEntity, dataSource.createEntityManager());
    }
}
