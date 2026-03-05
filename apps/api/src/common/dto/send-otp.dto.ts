import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Matches } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '+447700900000', description: 'Phone number (E.164)' })
  @IsString()
  @Matches(/^\+?[\d\s-]{10,}$/, { message: 'Invalid phone number' })
  phoneNumber!: string;

  @ApiProperty({ example: 'customer', required: false })
  @IsOptional()
  @IsString()
  role?: string;
}
