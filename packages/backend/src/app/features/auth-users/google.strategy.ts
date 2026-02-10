import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private configService: ConfigService) {
        const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

        if (!clientID || !clientSecret || clientID === 'your-google-client-id') {
            console.warn('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing or using placeholder in environment variables. Google Sign-in will not work.');
        }

        super({
            clientID: clientID,
            clientSecret: clientSecret,
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL', 'http://localhost:3001/auth-users/google/callback'),
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { name, emails, photos, id } = profile;
        const user = {
            googleId: id,
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
        };
        done(null, user);
    }
}
