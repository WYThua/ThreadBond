import { PrismaClient, ChatRoom, Message } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 聊天房间数据访问层
 */
export class ChatRepository {
  /**
   * 创建聊天房间
   */
  async createChatRoom(data: {
    participant1Id: string;
    participant2Id: string;
    clueId: string;
    autoCreated?: boolean;
  }): Promise<ChatRoom> {
    return await prisma.chatRoom.create({
      data: {
        participant1Id: data.participant1Id,
        participant2Id: data.participant2Id,
        clueId: data.clueId,
        autoCreated: data.autoCreated ?? true,
        isActive: true,
        identityRevealed: false
      },
      include: {
        participant1: true,
        participant2: true,
        clue: true
      }
    });
  }

  /**
   * 根据ID获取聊天房间
   */
  async getChatRoomById(roomId: string): Promise<ChatRoom | null> {
    return await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        participant1: true,
        participant2: true,
        clue: true,
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1
        }
      }
    });
  }

  /**
   * 检查聊天房间是否存在
   */
  async chatRoomExists(participant1Id: string, participant2Id: string, clueId: string): Promise<ChatRoom | null> {
    return await prisma.chatRoom.findFirst({
      where: {
        OR: [
          {
            participant1Id,
            participant2Id,
            clueId
          },
          {
            participant1Id: participant2Id,
            participant2Id: participant1Id,
            clueId
          }
        ]
      }
    });
  }

  /**
   * 获取用户的所有聊天房间
   */
  async getUserChatRooms(anonymousId: string, includeInactive: boolean = false): Promise<ChatRoom[]> {
    const where: any = {
      OR: [
        { participant1Id: anonymousId },
        { participant2Id: anonymousId }
      ]
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    return await prisma.chatRoom.findMany({
      where,
      include: {
        participant1: true,
        participant2: true,
        clue: true,
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });
  }

  /**
   * 更新聊天房间最后消息时间
   */
  async updateLastMessageTime(roomId: string): Promise<ChatRoom> {
    return await prisma.chatRoom.update({
      where: { id: roomId },
      data: { lastMessageAt: new Date() }
    });
  }

  /**
   * 结束聊天房间
   */
  async endChatRoom(roomId: string, endedBy: string): Promise<ChatRoom> {
    return await prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        isActive: false,
        endedBy,
        endedAt: new Date()
      }
    });
  }

  /**
   * 身份揭示
   */
  async revealIdentity(roomId: string, userId: string): Promise<ChatRoom> {
    const chatRoom = await this.getChatRoomById(roomId);
    
    if (!chatRoom) {
      throw new Error('聊天房间不存在');
    }

    // 获取当前已揭示身份的用户列表
    const revealedBy = (chatRoom.identityRevealedBy as string[]) || [];
    
    // 如果用户还未揭示身份，添加到列表
    if (!revealedBy.includes(userId)) {
      revealedBy.push(userId);
    }

    // 如果双方都同意揭示身份，设置 identityRevealed 为 true
    const bothRevealed = revealedBy.length === 2;

    return await prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        identityRevealedBy: revealedBy,
        identityRevealed: bothRevealed
      }
    });
  }

  /**
   * 创建消息
   */
  async createMessage(data: {
    roomId: string;
    senderId: string;
    content: any;
    type: string;
    isEncrypted?: boolean;
    isSystemMessage?: boolean;
  }): Promise<Message> {
    return await prisma.message.create({
      data: {
        roomId: data.roomId,
        senderId: data.senderId,
        content: data.content,
        type: data.type,
        isEncrypted: data.isEncrypted ?? false,
        isSystemMessage: data.isSystemMessage ?? false
      },
      include: {
        sender: true
      }
    });
  }

  /**
   * 获取聊天历史
   */
  async getChatHistory(
    roomId: string,
    limit: number = 50,
    before?: Date
  ): Promise<Message[]> {
    const where: any = { roomId };
    
    if (before) {
      where.sentAt = { lt: before };
    }

    return await prisma.message.findMany({
      where,
      include: {
        sender: true
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: limit
    });
  }

  /**
   * 标记消息为已读
   */
  async markMessageAsRead(messageId: string): Promise<Message> {
    return await prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() }
    });
  }

  /**
   * 批量标记消息为已读
   */
  async markMessagesAsRead(messageIds: string[]): Promise<number> {
    const result = await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        readAt: null
      },
      data: { readAt: new Date() }
    });

    return result.count;
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadMessageCount(roomId: string, userId: string): Promise<number> {
    return await prisma.message.count({
      where: {
        roomId,
        senderId: { not: userId },
        readAt: null
      }
    });
  }

  /**
   * 删除聊天房间及其所有消息
   */
  async deleteChatRoom(roomId: string): Promise<void> {
    // Prisma 会自动级联删除相关消息
    await prisma.chatRoom.delete({
      where: { id: roomId }
    });
  }

  /**
   * 获取聊天房间统计信息
   */
  async getChatRoomStats(roomId: string): Promise<{
    totalMessages: number;
    unreadCount: number;
    lastMessageAt: Date | null;
  }> {
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    if (!chatRoom) {
      throw new Error('聊天房间不存在');
    }

    return {
      totalMessages: chatRoom._count.messages,
      unreadCount: 0, // 需要根据当前用户计算
      lastMessageAt: chatRoom.lastMessageAt
    };
  }
}

export const chatRepository = new ChatRepository();
