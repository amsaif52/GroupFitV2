import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/** Claims stored in the JWT. Add more when you sign the token at login. */
export interface JwtPayload {
  sub: string; // user id (required)
  email?: string;
  role?: string;
  locale?: string;
  name?: string;
  trainerId?: string; // when role is trainer
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'change-me-in-production',
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      locale: payload.locale,
      name: payload.name,
      trainerId: payload.trainerId,
    };
  }
}
