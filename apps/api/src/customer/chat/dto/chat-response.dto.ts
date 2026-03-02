import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({ example: 'Here are your upcoming sessions...' })
  message!: string;

  @ApiProperty({ description: 'Conversation id to send in the next request for multi-turn context' })
  conversationId!: string;
}
