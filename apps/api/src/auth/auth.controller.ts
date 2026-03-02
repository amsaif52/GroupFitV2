import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../common/dto/login.dto';
import { GoogleAuthDto } from '../common/dto/google-auth.dto';
import { AppleAuthDto } from '../common/dto/apple-auth.dto';

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
}