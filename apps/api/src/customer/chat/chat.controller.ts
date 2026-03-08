import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { API_PREFIXES } from '../../common/constants';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt.strategy';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@ApiTags('customer')
@Controller(API_PREFIXES.CUSTOMER)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a message to the assistant (requires customer JWT)' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, description: 'Assistant reply', type: ChatResponseDto })
  async chat(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendMessageDto
  ): Promise<ChatResponseDto> {
    const result = await this.chatService.sendMessage(user.sub, dto.message, dto.conversationId);
    return { message: result.message, conversationId: result.conversationId };
  }
}
