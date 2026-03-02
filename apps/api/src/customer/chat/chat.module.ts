import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConversationService } from './conversation.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ConversationService],
  exports: [ChatService],
})
export class ChatModule {}
