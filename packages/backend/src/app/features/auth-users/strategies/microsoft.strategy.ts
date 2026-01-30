import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthUsersService } from '../auth-users.service';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
    constructor(
        private authService: AuthUsersService,
        private configService: ConfigService
    ) {
        super({
            clientID: configService.get<string>('MICROSOFT_CLIENT_ID') || 'place-holder',
            clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET') || 'place-holder',
            callbackURL: configService.get<string>('MICROSOFT_CALLBACK_URL') || 'http://localhost:3001/api/auth-users/social/microsoft/callback',
            scope: ['user.read'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any, info?: any) => void): Promise<any> {
        const { name, emails, id } = profile;
        const user = {
            email: emails && emails[0].value,
            firstName: name?.givenName,
            lastName: name?.familyName,
            microsoftId: id,
            accessToken
        };

        const payload = await this.authService.validateSocialUser('microsoft', user);
        done(null, payload);
    }
}
