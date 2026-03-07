import { ApiProperty } from '@nestjs/swagger';

export class TrainerChatResponseDto {
  @ApiProperty({ example: 'Here are your sessions today...' })
  message!: string;

  @ApiProperty({
    description: 'Conversation id to send in the next request for multi-turn context',
  })
  conversationId!: string;
}
