import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'What are my upcoming sessions?' })
  @IsString()
  @MaxLength(4000)
  message!: string;

  @ApiPropertyOptional({ description: 'Conversation id for multi-turn context' })
  @IsOptional()
  @IsString()
  conversationId?: string;
}
