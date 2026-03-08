import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Matches } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '+447700900000', description: 'Phone number (E.164)' })
  @IsString()
  @Matches(/^\+?[\d\s-]{10,}$/, { message: 'Invalid phone number' })
  data!: string;

  @ApiProperty({ example: 'phone', description: 'Type of payload: phone or email' })
  @IsString()
  type?: 'phone' | 'email';
}
