import { HttpException, HttpStatus } from '@nestjs/common';

export class ErrorResponse extends HttpException {
    constructor(
        public readonly code: number,
        public override readonly message: string,
        public readonly statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
        public readonly data?: any
    ) {
        super(
            {
                success: false,
                code,
                message,
                data,
            },
            statusCode
        );
    }
}

export class SuccessResponse<T = any> {
    constructor(
        public readonly data: T,
        public readonly message: string = 'Success',
        public readonly code: number = 1
    ) { }

    toJSON() {
        return {
            success: true,
            code: this.code,
            message: this.message,
            data: this.data,
        };
    }
}
