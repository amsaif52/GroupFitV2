import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import verifyAppleToken from 'verify-apple-id-token';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './jwt.strategy';
import { Twilio } from 'twilio';

export interface LoginResult {
  accessToken: string;
  user: { id: string; email: string; role: string; locale: string | null; name?: string | null };
}

const DEFAULT_ROLE = 'customer';
const OTP_EXPIRY_MINUTES = 5;
const SIGNUP_OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 min for signup
const OTP_EMAIL_DOMAIN = '@otp.groupfit.local';

interface PendingSignup {
  otp: string;
  expiresAt: number;
  name: string;
  email: string;
  country: string;
  state: string;
  role: string;
  referralCode?: string;
}

/** Generate a 4-digit OTP. */
function generateOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/** Normalize phone for storage (digits only, keep leading + if present for E.164). */
function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

/** Build a unique email for phone-only users. */
function emailForPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `p${digits}${OTP_EMAIL_DOMAIN}`;
}

@Injectable()
export class AuthService {
  private twilioClient: Twilio;
  private readonly pendingSignups = new Map<string, PendingSignup>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {
    const accountSid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.config.get<string>('TWILIO_AUTH_TOKEN');
    if (!accountSid || !authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required');
    }
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    return this.issueToken(user);
  }

  /**
   * Sign up with email and password. Creates user and returns JWT (same shape as Login).
   * Throws ConflictException if email already exists.
   */
  async signup(
    email: string,
    password: string,
    name?: string,
    role?: string
  ): Promise<LoginResult> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }
    const user = await this.prisma.user.create({
      data: {
        email,
        name: name ?? null,
        role: role ?? DEFAULT_ROLE,
        locale: 'en',
      },
    });
    return this.issueToken(user);
  }

  async loginWithGoogle(idToken: string, role?: string): Promise<LoginResult> {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) throw new UnauthorizedException('Google sign-in is not configured');

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email) throw new UnauthorizedException('Invalid Google token');

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
    if (!clientId) throw new UnauthorizedException('Apple sign-in is not configured');

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
          'Apple did not provide an email. Sign in with Apple requires email on first sign-in.'
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

  /**
   * Signup step 1: validate signup data, send OTP to phone. Phone/email must not already be registered.
   */
  async signupSendOtp(data: {
    name: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    role: string;
    referralCode?: string;
  }): Promise<{ message: string }> {
    const phone = normalizePhone(data.phone);
    if (phone.length < 10) {
      throw new BadRequestException('Invalid phone number');
    }
    const email = data.email.trim().toLowerCase();
    const existingByEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      throw new ConflictException('An account with this email already exists.');
    }
    const existingByPhone = await this.prisma.user.findUnique({ where: { phone } });
    if (existingByPhone) {
      throw new ConflictException('An account with this phone number already exists.');
    }
    const otp = generateOtp();
    const expiresAt = Date.now() + SIGNUP_OTP_EXPIRY_MS;
    this.pendingSignups.set(phone, {
      otp,
      expiresAt,
      name: data.name,
      email,
      country: data.country,
      state: data.state,
      role: data.role === 'trainer' ? 'trainer' : 'customer',
      referralCode: data.referralCode,
    });
    await this.sendOtpSms(phone, otp);
    return { message: 'OTP sent successfully' };
  }

  /**
   * Signup step 2: verify OTP and create account. Returns JWT.
   */
  async signupVerify(data: {
    otp: string;
    phone: string;
    name: string;
    email: string;
    country: string;
    state: string;
    role: string;
    referralCode?: string;
  }): Promise<LoginResult> {
    const phone = normalizePhone(data.phone);
    const pending = this.pendingSignups.get(phone);
    if (!pending) {
      throw new UnauthorizedException('OTP expired or not found. Please request a new code.');
    }
    if (Date.now() > pending.expiresAt) {
      this.pendingSignups.delete(phone);
      throw new UnauthorizedException('OTP has expired. Please request a new code.');
    }
    if (pending.otp !== data.otp) {
      throw new UnauthorizedException('Invalid OTP.');
    }
    this.pendingSignups.delete(phone);
    const email = data.email.trim().toLowerCase();
    const user = await this.prisma.user.create({
      data: {
        email,
        name: data.name,
        phone,
        countryCode: data.country,
        state: data.state,
        role: data.role,
        locale: 'en',
      } as Prisma.UserCreateInput,
    });
    return this.issueToken(user);
  }

  /**
   * Send OTP to phone: find or create user by phone, store OTP (5 min expiry), send SMS if Twilio configured.
   */
  async sendOtp(
    data: string,
    type?: 'phone' | 'email'
  ): Promise<{ message: string; userCode: string }> {
    const otp = generateOtp();
    const email = type === 'email' ? data.trim() : emailForPhone(normalizePhone(data));
    const phone = type === 'phone' ? normalizePhone(data) : null;

    const orConditions: Array<{ phone: string } | { email: string }> = [];
    if (phone != null && phone.length >= 10) orConditions.push({ phone });
    if (email) orConditions.push({ email });
    let user =
      orConditions.length > 0
        ? await this.prisma.user.findFirst({ where: { OR: orConditions } })
        : null;
    if (!user) {
      throw new BadRequestException('User not found.');
    }
    user = await this.prisma.user.update({
      where: { id: user.id },
      data: { otp, otpSentAt: new Date() },
    });
    if (phone) await this.sendOtpSms(phone, otp);
    return { message: 'OTP sent successfully', userCode: user.id };
  }

  /**
   * Resend OTP: by phone or by userCode. Same as sendOtp but can target existing user by userCode.
   */
  async resendOtp(
    phoneNumber: string,
    userCode?: string
  ): Promise<{ message: string; userCode: string }> {
    const phone = normalizePhone(phoneNumber);
    if (phone.length < 10) {
      throw new BadRequestException('Invalid phone number');
    }
    const otp = generateOtp();

    let user = userCode
      ? await this.prisma.user.findFirst({ where: { id: userCode, phone } })
      : await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      throw new BadRequestException('User not found for this phone number');
    }

    user = await this.prisma.user.update({
      where: { id: user.id },
      data: { otp, otpSentAt: new Date() },
    });

    await this.sendOtpSms(phone, otp);
    return { message: 'OTP sent successfully', userCode: user.id };
  }

  /**
   * Verify OTP and return JWT. OTP must match and be within 5 minutes of otpSentAt.
   */
  async verifyOtp(otp: string, userCode: string): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({ where: { id: userCode } });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    if (!user.otp || user.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP.');
    }
    if (!user.otpSentAt) {
      throw new UnauthorizedException('Otp verification failed. Please retry.');
    }
    const expiry = new Date(user.otpSentAt.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
    if (new Date() > expiry) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { otp: null, otpSentAt: null },
      });
      throw new UnauthorizedException('Otp has been expired.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp: null, otpSentAt: null },
    });

    return this.issueToken(user);
  }

  /**
   * Send OTP via Twilio SMS if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set.
   * Otherwise no-op (for local dev).
   */
  private async sendOtpSms(phone: string, otp: string): Promise<void> {
    const fromNumber = this.config.get<string>('TWILIO_FROM_NUMBER');
    if (!fromNumber) {
      throw new Error('TWILIO_FROM_NUMBER is required');
    }
    try {
      await this.twilioClient.messages.create({
        body: `Your OTP for secure verification is ${otp}. Please use this code for verification. Do not share this code with anyone for security reasons.`,
        from: fromNumber,
        to: phone,
      });
    } catch (error) {
      console.error('Error sending OTP SMS', error);
      throw new BadRequestException('Failed to send OTP SMS');
    }
  }

  /**
   * Send an SMS (e.g. group invite). No-op if Twilio not configured. Logs errors but does not throw.
   */
  async sendSms(phone: string, body: string): Promise<void> {
    const fromNumber = this.config.get<string>('TWILIO_FROM_NUMBER');
    if (!fromNumber || !this.twilioClient) return;
    try {
      await this.twilioClient.messages.create({
        body,
        from: fromNumber,
        to: phone,
      });
    } catch (error) {
      console.error('Error sending SMS', error);
    }
  }

  private issueToken(user: {
    id: string;
    email: string;
    role: string;
    locale: string | null;
    name?: string | null;
  }): LoginResult {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      locale: user.locale ?? undefined,
      name: user.name ?? undefined,
    };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        locale: user.locale,
        name: user.name ?? null,
      },
    };
  }

  /** Public: list countries for phone prefix dropdown (name, isdCode from DB). */
  async countryListForPhone() {
    const list = await this.prisma.country.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, isdCode: true },
    });
    return { mtype: 'success', list };
  }
}
