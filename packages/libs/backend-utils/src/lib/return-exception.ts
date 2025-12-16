import { HttpStatus } from '@nestjs/common';
import { ErrorResponse } from './error-response';

export function returnException(
    message: string,
    code: number = 0,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    data?: any
): ErrorResponse {
    return new ErrorResponse(code, message, statusCode, data);
}
