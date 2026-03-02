import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class AppleAuthDto {
  @ApiProperty({ description: 'Apple identity_token from client (web or native)' })
  @IsString()
  idToken!: string;

  @ApiProperty({ description: 'Role for new user (default: customer)', required: false })
  @IsOptional()
  @IsIn(['customer', 'trainer', 'admin'], { message: 'role must be customer, trainer, or admin' })
  role?: string;
}
