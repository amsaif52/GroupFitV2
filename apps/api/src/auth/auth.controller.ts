import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../common/dto/login.dto';
import { SignupDto } from '../common/dto/signup.dto';
import { GoogleAuthDto } from '../common/dto/google-auth.dto';
import { AppleAuthDto } from '../common/dto/apple-auth.dto';
import { VerifyOtpDto } from '../common/dto/verify-otp.dto';
import { ResendOtpDto } from '../common/dto/resend-otp.dto';
import { SendOtpDto } from '../common/dto/send-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password; returns JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Returns accessToken and user' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Sign up with name, email, password; returns JWT' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'Returns accessToken and user' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto.email, dto.password, dto.name, dto.role);
  }

  @Post('google')
  @ApiOperation({ summary: 'Login/signup with Google ID token; returns JWT' })
  @ApiBody({ type: GoogleAuthDto })
  @ApiResponse({ status: 200, description: 'Returns accessToken and user' })
  @ApiResponse({ status: 401, description: 'Invalid or expired Google token' })
  async google(@Body() dto: GoogleAuthDto) {
    return this.auth.loginWithGoogle(dto.idToken, dto.role);
  }

  @Post('apple')
  @ApiOperation({ summary: 'Login/signup with Apple identity_token; returns JWT' })
  @ApiBody({ type: AppleAuthDto })
  @ApiResponse({ status: 200, description: 'Returns accessToken and user' })
  @ApiResponse({ status: 401, description: 'Invalid or expired Apple token' })
  async apple(@Body() dto: AppleAuthDto) {
    return this.auth.loginWithApple(dto.idToken, dto.role);
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to phone number; returns userCode for verify-otp' })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({ status: 200, description: 'OTP sent; returns message and userCode' })
  @ApiResponse({ status: 400, description: 'Invalid phone number' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.phoneNumber, dto.role);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and return JWT' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'Returns accessToken and user' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.otp, dto.userCode);
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP to phone number' })
  @ApiBody({ type: ResendOtpDto })
  @ApiResponse({ status: 200, description: 'OTP sent; returns message and userCode' })
  @ApiResponse({ status: 400, description: 'Invalid phone or user not found' })
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.auth.resendOtp(dto.phoneNumber, dto.userCode);
  }
}