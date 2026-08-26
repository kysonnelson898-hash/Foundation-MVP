import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesGateway } from './messages.gateway';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async createConversation(
    userId: string,
    otherUserId: string,
  ) {
    if (userId === otherUserId) {
      throw new ForbiddenException(
        'You cannot create a conversation with yourself',
      );
    }

    const otherUser =
      await this.prisma.user.findUnique({
        where: {
          id: otherUserId,
        },
        select: {
          id: true,
        },
      });

    if (!otherUser) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const existing =
      await this.prisma.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: {
                  userId,
                },
              },
            },
            {
              participants: {
                some: {
                  userId: otherUserId,
                },
              },
            },
          ],
        },
        include: {
          participants: true,
        },
      });

    if (
      existing &&
      existing.participants.length === 2
    ) {
      return existing;
    }

    return this.prisma.conversation.create({
      data: {
        participants: {
          create: [
            {
              userId,
            },
            {
              userId: otherUserId,
            },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async getMessages(
    userId: string,
    conversationId: string,
  ) {
    await this.verifyParticipant(
      userId,
      conversationId,
    );

    return this.prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    sendMessageDto: SendMessageDto,
  ) {
    await this.verifyParticipant(
      userId,
      conversationId,
    );

    const message =
      await this.prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content:
            sendMessageDto.content.trim(),
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

    await this.prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    this.messagesGateway.sendMessageToConversation(
      conversationId,
      message,
    );

    return message;
  }

  async markMessagesRead(
    userId: string,
    conversationId: string,
  ) {
    await this.verifyParticipant(
      userId,
      conversationId,
    );

    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: userId,
        },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return {
      success: true,
    };
  }

  private async verifyParticipant(
    userId: string,
    conversationId: string,
  ) {
    const participant =
      await this.prisma.conversationParticipant.findUnique(
        {
          where: {
            conversationId_userId: {
              conversationId,
              userId,
            },
          },
        },
      );

    if (!participant) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    return participant;
  }
}
