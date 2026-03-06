import { Module, forwardRef } from '@nestjs/common';
import { TrainerChatController } from './trainer-chat.controller';
import { TrainerChatService } from './trainer-chat.service';
import { TrainerConversationService } from './conversation.service';
import { TrainerModule } from '../trainer.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [forwardRef(() => TrainerModule), PrismaModule, AuthModule],
  controllers: [TrainerChatController],
  providers: [TrainerChatService, TrainerConversationService],
  exports: [TrainerChatService],
})
export class TrainerChatModule {}
