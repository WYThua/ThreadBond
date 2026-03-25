import { PrismaClient } from '@prisma/client';
import { chatService } from '../services/chatService';
import { chatRepository } from '../repositories/chatRepository';

// 模拟 Prisma 客户端
jest.mock('@prisma/client');

// 模拟 Redis 服务
jest.mock('../config/redis', () => ({
  getRedisService: () => ({
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    lPush: jest.fn(),
    lRange: jest.fn(),
    lPop: jest.fn(),
    expire: jest.fn()
  }),
  getRedisClient: () => null
}));

describe('ChatService', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('createChatRoom', () => {
    it('应该成功创建聊天房间', async () => {
      const mockChatRoom = {
        id: 'room_123',
        participant1Id: 'user_1',
        participant2Id: 'user_2',
        clueId: 'clue_123',
        createdAt: new Date(),
        lastMessageAt: null,
        isActive: true,
        identityRevealed: false,
        identityRevealedBy: null,
        endedBy: null,
        endedAt: null,
        autoCreated: true
      };

      // 模拟 chatRepository.chatRoomExists 返回 null（房间不存在）
      jest.spyOn(chatRepository, 'chatRoomExists').mockResolvedValue(null);
      
      // 模拟 chatRepository.createChatRoom
      jest.spyOn(chatRepository, 'createChatRoom').mockResolvedValue(mockChatRoom as any);

      // 模拟 chatRepository.createMessage（系统欢迎消息）
      jest.spyOn(chatRepository, 'createMessage').mockResolvedValue({} as any);

      const result = await chatService.createChatRoom('user_1', 'user_2', 'clue_123');

      expect(result).toBeDefined();
      expect(result.id).toBe('room_123');
      expect(result.participant1Id).toBe('user_1');
      expect(result.participant2Id).toBe('user_2');
      expect(result.autoCreated).toBe(true);
    });

    it('应该返回已存在的聊天房间', async () => {
      const existingRoom = {
        id: 'room_existing',
        participant1Id: 'user_1',
        participant2Id: 'user_2',
        clueId: 'clue_123',
        isActive: true,
        autoCreated: true
      };

      jest.spyOn(chatRepository, 'chatRoomExists').mockResolvedValue(existingRoom as any);

      const result = await chatService.createChatRoom('user_1', 'user_2', 'clue_123');

      expect(result.id).toBe('room_existing');
    });
  });

  describe('validateRoomAccess', () => {
    it('应该验证用户有权限访问房间', async () => {
      const mockChatRoom = {
        id: 'room_123',
        participant1Id: 'user_1',
        participant2Id: 'user_2',
        isActive: true
      };

      jest.spyOn(chatRepository, 'getChatRoomById').mockResolvedValue(mockChatRoom as any);

      const hasAccess = await chatService.validateRoomAccess('room_123', 'user_1');

      expect(hasAccess).toBe(true);
    });

    it('应该拒绝无权限用户访问房间', async () => {
      const mockChatRoom = {
        id: 'room_123',
        participant1Id: 'user_1',
        participant2Id: 'user_2',
        isActive: true
      };

      jest.spyOn(chatRepository, 'getChatRoomById').mockResolvedValue(mockChatRoom as any);

      const hasAccess = await chatService.validateRoomAccess('room_123', 'user_3');

      expect(hasAccess).toBe(false);
    });

    it('应该拒绝访问不活跃的房间', async () => {
      const mockChatRoom = {
        id: 'room_123',
        participant1Id: 'user_1',
        participant2Id: 'user_2',
        isActive: false
      };

      jest.spyOn(chatRepository, 'getChatRoomById').mockResolvedValue(mockChatRoom as any);

      const hasAccess = await chatService.validateRoomAccess('room_123', 'user_1');

      expect(hasAccess).toBe(false);
    });
  });

  describe('sendMessage', () => {
    it('应该成功发送消息', async () => {
      const mockChatRoom = {
        id: 'room_123',
        participant1Id: 'user_1',
        participant2Id: 'user_2',
        isActive: true
      };

      const mockMessage = {
        id: 'msg_123',
        roomId: 'room_123',
        senderId: 'user_1',
        content: { text: 'Hello' },
        type: 'TEXT',
        sentAt: new Date(),
        isEncrypted: false
      };

      jest.spyOn(chatRepository, 'getChatRoomById').mockResolvedValue(mockChatRoom as any);
      jest.spyOn(chatRepository, 'createMessage').mockResolvedValue(mockMessage as any);
      jest.spyOn(chatRepository, 'updateLastMessageTime').mockResolvedValue({} as any);

      const result = await chatService.sendMessage('room_123', 'user_1', { text: 'Hello' }, 'TEXT');

      expect(result).toBeDefined();
      expect(result.content).toEqual({ text: 'Hello' });
      expect(result.type).toBe('TEXT');
    });

    it('应该拒绝无权限用户发送消息', async () => {
      const mockChatRoom = {
        id: 'room_123',
        participant1Id: 'user_1',
        participant2Id: 'user_2',
        isActive: true
      };

      jest.spyOn(chatRepository, 'getChatRoomById').mockResolvedValue(mockChatRoom as any);

      await expect(
        chatService.sendMessage('room_123', 'user_3', { text: 'Hello' }, 'TEXT')
      ).rejects.toThrow('无权限在此房间发送消息');
    });
  });

  describe('endChat', () => {
    it('应该成功结束聊天', async () => {
      const mockChatRoom = {
        id: 'room_123',
        participant1Id: 'user_1',
        participant2Id: 'user_2',
        isActive: true
      };

      const endedRoom = {
        ...mockChatRoom,
        isActive: false,
        endedBy: 'user_1',
        endedAt: new Date()
      };

      jest.spyOn(chatRepository, 'getChatRoomById').mockResolvedValue(mockChatRoom as any);
      jest.spyOn(chatRepository, 'createMessage').mockResolvedValue({} as any);
      jest.spyOn(chatRepository, 'endChatRoom').mockResolvedValue(endedRoom as any);

      const result = await chatService.endChat('room_123', 'user_1');

      expect(result.isActive).toBe(false);
      expect(result.endedBy).toBe('user_1');
    });
  });

  describe('revealIdentity', () => {
    it('应该记录单方身份揭示', async () => {
      const mockChatRoom = {
        id: 'room_123',
        participant1Id: 'user_1',
        participant2Id: 'user_2',
        isActive: true,
        identityRevealed: false,
        identityRevealedBy: []
      };

      const updatedRoom = {
        ...mockChatRoom,
        identityRevealedBy: ['user_1'],
        identityRevealed: false
      };

      jest.spyOn(chatRepository, 'getChatRoomById').mockResolvedValue(mockChatRoom as any);
      jest.spyOn(chatRepository, 'revealIdentity').mockResolvedValue(updatedRoom as any);
      jest.spyOn(chatRepository, 'createMessage').mockResolvedValue({} as any);

      const result = await chatService.revealIdentity('room_123', 'user_1');

      expect(result.bothRevealed).toBe(false);
      expect(result.chatRoom.identityRevealedBy).toContain('user_1');
    });

    it('应该在双方都同意时完成身份揭示', async () => {
      const mockChatRoom = {
        id: 'room_123',
        participant1Id: 'user_1',
        participant2Id: 'user_2',
        isActive: true,
        identityRevealed: false,
        identityRevealedBy: ['user_1']
      };

      const updatedRoom = {
        ...mockChatRoom,
        identityRevealedBy: ['user_1', 'user_2'],
        identityRevealed: true
      };

      jest.spyOn(chatRepository, 'getChatRoomById').mockResolvedValue(mockChatRoom as any);
      jest.spyOn(chatRepository, 'revealIdentity').mockResolvedValue(updatedRoom as any);
      jest.spyOn(chatRepository, 'createMessage').mockResolvedValue({} as any);

      const result = await chatService.revealIdentity('room_123', 'user_2');

      expect(result.bothRevealed).toBe(true);
      expect(result.chatRoom.identityRevealed).toBe(true);
    });
  });
});
