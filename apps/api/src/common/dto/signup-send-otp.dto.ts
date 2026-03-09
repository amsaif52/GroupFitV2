import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsIn } from 'class-validator';

export class SignupSendOtpDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+14155551234' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  country!: string;

  @ApiProperty({ example: 'CA' })
  @IsString()
  state!: string;

  @ApiProperty({ example: 'customer', enum: ['customer', 'trainer'] })
  @IsString()
  @IsIn(['customer', 'trainer'])
  role!: string;

  @ApiProperty({ example: 'REF123', required: false })
  @IsOptional()
  @IsString()
  referralCode?: string;
}
