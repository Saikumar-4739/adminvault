
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

const SECRET_KEY = "2c6ee24b09816a6c6de4f1d3f8c3c0a6559dca86b6f710d930d3603fdbb724";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: SECRET_KEY });
    }

    async validate(payload: any) {
        return { userId: payload.sub, email: payload.email, companyId: payload.companyId };
    }
}
