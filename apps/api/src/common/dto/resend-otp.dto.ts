import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({ example: '+447700900000', description: 'Phone number to resend OTP to' })
  @IsString()
  phoneNumber!: string;

  @ApiProperty({ example: 'user-123', required: false })
  @IsOptional()
  @IsString()
  userCode?: string;
}
