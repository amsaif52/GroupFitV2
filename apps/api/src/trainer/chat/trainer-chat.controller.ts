import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { API_PREFIXES } from '@groupfit/shared';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TrainerGuard } from '../../auth/trainer.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt.strategy';
import { TrainerChatService } from './trainer-chat.service';
import { TrainerSendMessageDto } from './dto/send-message.dto';
import { TrainerChatResponseDto } from './dto/chat-response.dto';

@ApiTags('trainer')
@Controller(API_PREFIXES.TRAINER)
@UseGuards(JwtAuthGuard, TrainerGuard)
@ApiBearerAuth()
export class TrainerChatController {
  constructor(private readonly chatService: TrainerChatService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a message to the trainer assistant (requires trainer or admin JWT)' })
  @ApiBody({ type: TrainerSendMessageDto })
  @ApiResponse({ status: 200, description: 'Assistant reply', type: TrainerChatResponseDto })
  async chat(
    @CurrentUser() user: JwtPayload,
    @Body() dto: TrainerSendMessageDto,
  ): Promise<TrainerChatResponseDto> {
    const result = await this.chatService.sendMessage(user.sub, dto.message, dto.conversationId);
    return { message: result.message, conversationId: result.conversationId };
  }
}
