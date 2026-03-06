import { Module, forwardRef } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConversationService } from './conversation.service';
import { CustomerModule } from '../customer.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [forwardRef(() => CustomerModule), PrismaModule],
  controllers: [ChatController],
  providers: [ChatService, ConversationService],
  exports: [ChatService],
})
export class ChatModule {}
