import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import verifyAppleToken from 'verify-apple-id-token';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './jwt.strategy';

export interface LoginResult {
  accessToken: string;
  user: { id: string; email: string; role: string; locale: string | null };
}

const DEFAULT_ROLE = 'customer';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (!user.passwordHash)
      throw new UnauthorizedException('This account uses social sign-in. Use Google or Apple.');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');

    return this.issueToken(user);
  }

  async loginWithGoogle(idToken: string, role?: string): Promise<LoginResult> {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId)
      throw new UnauthorizedException('Google sign-in is not configured');

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email)
      throw new UnauthorizedException('Invalid Google token');

    const googleId = payload.sub;
    const email = payload.email;

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });
    if (user) {
      if (!user.googleId)
        await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
    } else {
      user = await this.prisma.user.create({
        data: {
          email,
          googleId,
          role: role ?? DEFAULT_ROLE,
          locale: 'en',
        },
      });
    }

    return this.issueToken(user);
  }

  async loginWithApple(idToken: string, role?: string): Promise<LoginResult> {
    const clientId = this.config.get<string>('APPLE_CLIENT_ID');
    if (!clientId)
      throw new UnauthorizedException('Apple sign-in is not configured');

    const jwtClaims = await verifyAppleToken({
      idToken,
      clientId,
    });
    const appleId = jwtClaims.sub;
    const email = (jwtClaims.email as string) || null;

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ appleId }, ...(email ? [{ email }] : [])] },
    });
    if (user) {
      if (!user.appleId)
        await this.prisma.user.update({
          where: { id: user.id },
          data: { appleId },
        });
    } else {
      if (!email)
        throw new UnauthorizedException(
          'Apple did not provide an email. Sign in with Apple requires email on first sign-in.',
        );
      user = await this.prisma.user.create({
        data: {
          email,
          appleId,
          role: role ?? DEFAULT_ROLE,
          locale: 'en',
        },
      });
    }

    return this.issueToken(user);
  }

  private issueToken(user: {
    id: string;
    email: string;
    role: string;
    locale: string | null;
  }): LoginResult {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      locale: user.locale ?? undefined,
    };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        locale: user.locale,
      },
    };
  }
}
