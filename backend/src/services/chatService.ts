import { ChatRoom, Message } from '@prisma/client';
import { chatRepository } from '../repositories/chatRepository';
import { getRedisService } from '../config/redis';

/**
 * 聊天服务层
 */
export class ChatService {
  private redisService = getRedisService();

  /**
   * 创建聊天房间（解密成功后自动调用）
   */
  async createChatRoom(
    participant1Id: string,
    participant2Id: string,
    clueId: string
  ): Promise<ChatRoom> {
    // 检查是否已存在聊天房间
    const existingRoom = await chatRepository.chatRoomExists(
      participant1Id,
      participant2Id,
      clueId
    );

    if (existingRoom) {
      // 如果房间已存在但被关闭，重新激活
      if (!existingRoom.isActive) {
        return await chatRepository.endChatRoom(existingRoom.id, ''); // 重新激活
      }
      return existingRoom;
    }

    // 创建新的聊天房间
    const chatRoom = await chatRepository.createChatRoom({
      participant1Id,
      participant2Id,
      clueId,
      autoCreated: true
    });

    // 创建系统欢迎消息
    await this.createSystemMessage(
      chatRoom.id,
      '欢迎来到匿名聊天室！你们可以在这里自由交流，保持匿名身份。'
    );

    // 缓存聊天房间信息
    await this.redisService.set(
      `chatroom:${chatRoom.id}`,
      chatRoom,
      3600 // 1小时过期
    );

    return chatRoom;
  }

  /**
   * 获取聊天房间详情
   */
  async getChatRoomById(roomId: string): Promise<ChatRoom | null> {
    // 先从缓存获取
    const cached = await this.redisService.get<ChatRoom>(`chatroom:${roomId}`);
    if (cached) {
      return cached;
    }

    // 从数据库获取
    const chatRoom = await chatRepository.getChatRoomById(roomId);
    
    if (chatRoom) {
      // 更新缓存
      await this.redisService.set(`chatroom:${roomId}`, chatRoom, 3600);
    }

    return chatRoom;
  }

  /**
   * 获取用户的聊天房间列表
   */
  async getUserChatRooms(anonymousId: string): Promise<ChatRoom[]> {
    return await chatRepository.getUserChatRooms(anonymousId, false);
  }

  /**
   * 验证用户是否有权限访问聊天房间
   */
  async validateRoomAccess(roomId: string, anonymousId: string): Promise<boolean> {
    const chatRoom = await this.getChatRoomById(roomId);
    
    if (!chatRoom) {
      return false;
    }

    return (
      chatRoom.isActive &&
      (chatRoom.participant1Id === anonymousId || chatRoom.participant2Id === anonymousId)
    );
  }

  /**
   * 发送消息
   */
  async sendMessage(
    roomId: string,
    senderId: string,
    content: any,
    type: string = 'TEXT'
  ): Promise<Message> {
    // 验证房间权限
    const hasAccess = await this.validateRoomAccess(roomId, senderId);
    if (!hasAccess) {
      throw new Error('无权限在此房间发送消息');
    }

    // 创建消息
    const message = await chatRepository.createMessage({
      roomId,
      senderId,
      content,
      type,
      isEncrypted: false // 后续实现端到端加密
    });

    // 更新房间最后消息时间
    await chatRepository.updateLastMessageTime(roomId);

    // 缓存最新消息
    await this.cacheMessage(roomId, message);

    // 清除房间缓存，强制下次重新获取
    await this.redisService.del(`chatroom:${roomId}`);

    return message;
  }

  /**
   * 创建系统消息
   */
  async createSystemMessage(roomId: string, text: string): Promise<Message> {
    // 获取房间信息以获取一个参与者ID作为发送者
    const chatRoom = await this.getChatRoomById(roomId);
    if (!chatRoom) {
      throw new Error('聊天房间不存在');
    }

    const message = await chatRepository.createMessage({
      roomId,
      senderId: chatRoom.participant1Id, // 使用第一个参与者ID
      content: { text, systemMessage: text },
      type: 'SYSTEM',
      isSystemMessage: true
    });

    await this.cacheMessage(roomId, message);

    return message;
  }

  /**
   * 获取聊天历史
   */
  async getChatHistory(
    roomId: string,
    anonymousId: string,
    limit: number = 50,
    before?: Date
  ): Promise<Message[]> {
    // 验证权限
    const hasAccess = await this.validateRoomAccess(roomId, anonymousId);
    if (!hasAccess) {
      throw new Error('无权限访问此聊天房间');
    }

    // 先尝试从缓存获取最新消息
    if (!before) {
      const cachedMessages = await this.redisService.lRange<Message>(
        `room:messages:${roomId}`,
        0,
        limit - 1
      );

      if (cachedMessages && cachedMessages.length > 0) {
        return cachedMessages.reverse(); // 反转顺序，最旧的在前
      }
    }

    // 从数据库获取
    const messages = await chatRepository.getChatHistory(roomId, limit, before);
    
    return messages.reverse(); // 反转顺序，最旧的在前
  }

  /**
   * 结束聊天
   */
  async endChat(roomId: string, userId: string): Promise<ChatRoom> {
    // 验证权限
    const hasAccess = await this.validateRoomAccess(roomId, userId);
    if (!hasAccess) {
      throw new Error('无权限结束此聊天');
    }

    // 创建系统消息
    await this.createSystemMessage(roomId, '聊天已结束');

    // 结束聊天房间
    const chatRoom = await chatRepository.endChatRoom(roomId, userId);

    // 清除缓存
    await this.redisService.del(`chatroom:${roomId}`);
    await this.redisService.del(`room:messages:${roomId}`);

    return chatRoom;
  }

  /**
   * 身份揭示
   */
  async revealIdentity(roomId: string, userId: string): Promise<{
    chatRoom: ChatRoom;
    bothRevealed: boolean;
  }> {
    // 验证权限
    const hasAccess = await this.validateRoomAccess(roomId, userId);
    if (!hasAccess) {
      throw new Error('无权限揭示身份');
    }

    // 揭示身份
    const chatRoom = await chatRepository.revealIdentity(roomId, userId);

    // 如果双方都同意揭示身份，创建系统消息
    if (chatRoom.identityRevealed) {
      await this.createSystemMessage(roomId, '双方已同意揭示真实身份');
    } else {
      await this.createSystemMessage(roomId, '一方已同意揭示身份，等待另一方确认');
    }

    // 清除缓存
    await this.redisService.del(`chatroom:${roomId}`);

    return {
      chatRoom,
      bothRevealed: chatRoom.identityRevealed
    };
  }

  /**
   * 标记消息为已读
   */
  async markMessagesAsRead(roomId: string, userId: string): Promise<number> {
    // 验证权限
    const hasAccess = await this.validateRoomAccess(roomId, userId);
    if (!hasAccess) {
      throw new Error('无权限访问此聊天房间');
    }

    // 获取未读消息
    const messages = await chatRepository.getChatHistory(roomId, 100);
    const unreadMessageIds = messages
      .filter(msg => msg.senderId !== userId && !msg.readAt)
      .map(msg => msg.id);

    if (unreadMessageIds.length === 0) {
      return 0;
    }

    // 批量标记为已读
    return await chatRepository.markMessagesAsRead(unreadMessageIds);
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadMessageCount(roomId: string, userId: string): Promise<number> {
    return await chatRepository.getUnreadMessageCount(roomId, userId);
  }

  /**
   * 删除聊天房间
   */
  async deleteChatRoom(roomId: string, userId: string): Promise<void> {
    // 验证权限
    const hasAccess = await this.validateRoomAccess(roomId, userId);
    if (!hasAccess) {
      throw new Error('无权限删除此聊天房间');
    }

    // 删除聊天房间
    await chatRepository.deleteChatRoom(roomId);

    // 清除缓存
    await this.redisService.del(`chatroom:${roomId}`);
    await this.redisService.del(`room:messages:${roomId}`);
  }

  /**
   * 缓存消息
   */
  private async cacheMessage(roomId: string, message: Message): Promise<void> {
    try {
      await this.redisService.lPush(`room:messages:${roomId}`, message);
      
      // 只保留最近100条消息在缓存中
      const messages = await this.redisService.lRange<Message>(
        `room:messages:${roomId}`,
        0,
        -1
      );
      
      if (messages.length > 100) {
        // 移除多余的消息
        for (let i = 100; i < messages.length; i++) {
          await this.redisService.lPop(`room:messages:${roomId}`);
        }
      }

      // 设置缓存过期时间（24小时）
      await this.redisService.expire(`room:messages:${roomId}`, 86400);
    } catch (error) {
      console.error('缓存消息失败:', error);
      // 不抛出错误，允许在没有缓存的情况下继续
    }
  }

  /**
   * 获取聊天房间统计信息
   */
  async getChatRoomStats(roomId: string, userId: string): Promise<{
    totalMessages: number;
    unreadCount: number;
    lastMessageAt: Date | null;
  }> {
    // 验证权限
    const hasAccess = await this.validateRoomAccess(roomId, userId);
    if (!hasAccess) {
      throw new Error('无权限访问此聊天房间');
    }

    const stats = await chatRepository.getChatRoomStats(roomId);
    const unreadCount = await this.getUnreadMessageCount(roomId, userId);

    return {
      ...stats,
      unreadCount
    };
  }
}

export const chatService = new ChatService();
