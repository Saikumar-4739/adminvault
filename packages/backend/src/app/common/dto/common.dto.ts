import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyIdRequestModel, IdRequestModel, UserIdRequestModel } from '@adminvault/shared-models';

export class CompanyIdDto extends CompanyIdRequestModel {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    override companyId: number;
}

export class IdDto extends IdRequestModel {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    override id: number;
}

export class UserIdDto extends UserIdRequestModel {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    override userId: number;
}
