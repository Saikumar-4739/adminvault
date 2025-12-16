import { HttpStatus } from '@nestjs/common';
import { ErrorResponse } from './error-response';
import { GlobalResponse } from './global-response';

// Overload 1: Accept a class constructor and error, return instance with error details
export function returnException<T extends GlobalResponse>(
    ResponseClass: new (status: boolean, code: number, message: string, ...args: any[]) => T,
    error: any
): T;

// Overload 2: Traditional usage with message string
export function returnException(
    message: string,
    code?: number,
    statusCode?: HttpStatus,
    data?: any
): ErrorResponse;

// Implementation
export function returnException<T extends GlobalResponse>(
    ResponseClassOrMessage: (new (status: boolean, code: number, message: string, ...args: any[]) => T) | string,
    errorOrCode?: any,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    data?: any
): T | ErrorResponse {
    // Pattern 1: Class-based error response
    if (typeof ResponseClassOrMessage === 'function') {
        const error = errorOrCode;
        const errorMessage = error?.message || 'An error occurred';
        const errorCode = error?.code || 0;

        // Return instance of the response class with error details
        return new ResponseClassOrMessage(false, errorCode, errorMessage);
    }

    // Pattern 2: Traditional error response
    const message = ResponseClassOrMessage;
    const code = errorOrCode || 0;
    return new ErrorResponse(code, message, statusCode, data);
}
