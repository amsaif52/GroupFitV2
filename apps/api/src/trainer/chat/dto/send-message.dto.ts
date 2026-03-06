import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class TrainerSendMessageDto {
  @ApiProperty({ example: 'What are my sessions today?' })
  @IsString()
  @MaxLength(4000)
  message!: string;

  @ApiPropertyOptional({ description: 'Conversation id for multi-turn context' })
  @IsOptional()
  @IsString()
  conversationId?: string;
}
