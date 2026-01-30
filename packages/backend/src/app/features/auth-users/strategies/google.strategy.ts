import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthUsersService } from '../auth-users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private authService: AuthUsersService,
        private configService: ConfigService
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'place-holder',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'place-holder',
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/api/auth-users/social/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any, info?: any) => void): Promise<any> {
        const { name, emails, photos, id } = profile;
        const user = {
            email: emails && emails[0].value,
            firstName: name?.givenName,
            lastName: name?.familyName,
            picture: photos && photos[0].value,
            accessToken,
            googleId: id
        };

        const payload = await this.authService.validateSocialUser('google', user);
        done(null, payload);
    }
}
