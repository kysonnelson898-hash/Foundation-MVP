import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
  ) {}

  @Get('conversations')
  getConversations(
    @Request() request: { user: { id: string } },
  ) {
    return this.messagesService.getConversations(
      request.user.id,
    );
  }

  @Post('conversations/:userId')
  createConversation(
    @Request() request: { user: { id: string } },
    @Param('userId') otherUserId: string,
  ) {
    return this.messagesService.createConversation(
      request.user.id,
      otherUserId,
    );
  }

  @Get('conversations/:conversationId')
  getMessages(
    @Request() request: { user: { id: string } },
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagesService.getMessages(
      request.user.id,
      conversationId,
    );
  }

  @Post('conversations/:conversationId')
  sendMessage(
    @Request() request: { user: { id: string } },
    @Param('conversationId') conversationId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(
      request.user.id,
      conversationId,
      sendMessageDto,
    );
  }

  @Patch('conversations/:conversationId/read')
  markMessagesRead(
    @Request() request: { user: { id: string } },
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagesService.markMessagesRead(
      request.user.id,
      conversationId,
    );
  }
}
