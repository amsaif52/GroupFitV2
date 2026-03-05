import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '1234', description: '4-digit OTP' })
  @IsString()
  @Length(4, 4, { message: 'OTP must be 4 digits' })
  @Matches(/^\d{4}$/, { message: 'OTP must be 4 digits' })
  otp!: string;

  @ApiProperty({ example: 'user-123', description: 'User/session code from request-otp step' })
  @IsString()
  userCode!: string;
}
