import { ClueService } from '../services/clueService';
import { ClueRepository } from '../repositories/clueRepository';
import { PrismaClient } from '@prisma/client';
import { CreateClueRequest, ClueType, DifficultyLevel } from '../types/clue';

// Mock Prisma Client
jest.mock('@prisma/client');
jest.mock('../repositories/clueRepository');

describe('ClueService', () => {
  let clueService: ClueService;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockClueRepository: jest.Mocked<ClueRepository>;

  beforeEach(() => {
    // 创建 mock Prisma 实例
    mockPrisma = {
      anonymousIdentity: {
        findUnique: jest.fn(),
      },
      clue: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      decryptionAttempt: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
      },
    } as any;

    mockClueRepository = new ClueRepository(mockPrisma) as jest.Mocked<ClueRepository>;
    clueService = new ClueService(mockPrisma);
    
    // 替换 clueService 中的 repository 实例
    (clueService as any).clueRepository = mockClueRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createClue', () => {
    const mockCreatorId = 'creator-123';
    const mockClueData: CreateClueRequest = {
      title: '测试线索',
      content: { text: '这是一个测试线索' },
      type: ClueType.TEXT,
      difficulty: DifficultyLevel.MEDIUM,
      solution: '测试答案',
      hints: ['提示1', '提示2'],
      tags: ['测试', '简单']
    };

    it('应该成功创建线索', async () => {
      // Mock 创建者存在
      mockPrisma.anonymousIdentity.findUnique = jest.fn().mockResolvedValue({
        id: mockCreatorId,
        displayName: '测试用户'
      });

      // Mock 创建线索成功
      const mockCreatedClue = {
        id: 'clue-123',
        creatorId: mockCreatorId,
        ...mockClueData,
        solution: 'hashed-solution',
        createdAt: new Date(),
        isActive: true,
        decryptionCount: 0,
        successfulDecryptions: 0,
        aiGenerated: false,
        creator: {
          id: mockCreatorId,
          displayName: '测试用户',
          avatarUrl: null
        }
      };

      mockClueRepository.create.mockResolvedValue(mockCreatedClue as any);

      const result = await clueService.createClue(mockCreatorId, mockClueData);

      expect(mockPrisma.anonymousIdentity.findUnique).toHaveBeenCalledWith({
        where: { id: mockCreatorId }
      });
      expect(mockClueRepository.create).toHaveBeenCalled();
      expect(result.id).toBe('clue-123');
      expect(result.title).toBe(mockClueData.title);
    });

    it('当创建者不存在时应该抛出错误', async () => {
      mockPrisma.anonymousIdentity.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        clueService.createClue(mockCreatorId, mockClueData)
      ).rejects.toThrow('创建者不存在');
    });

    it('当线索标题为空时应该抛出错误', async () => {
      // Mock 创建者存在
      mockPrisma.anonymousIdentity.findUnique = jest.fn().mockResolvedValue({
        id: mockCreatorId,
        displayName: '测试用户'
      });

      const invalidData = { ...mockClueData, title: '' };

      await expect(
        clueService.createClue(mockCreatorId, invalidData)
      ).rejects.toThrow('线索标题不能为空');
    });

    it('当解密答案为空时应该抛出错误', async () => {
      // Mock 创建者存在
      mockPrisma.anonymousIdentity.findUnique = jest.fn().mockResolvedValue({
        id: mockCreatorId,
        displayName: '测试用户'
      });

      const invalidData = { ...mockClueData, solution: '' };

      await expect(
        clueService.createClue(mockCreatorId, invalidData)
      ).rejects.toThrow('解密答案不能为空');
    });
  });

  describe('getClueById', () => {
    const mockClueId = 'clue-123';
    const mockUserId = 'user-123';

    it('应该成功获取线索详情', async () => {
      const mockClue = {
        id: mockClueId,
        title: '测试线索',
        content: { text: '测试内容' },
        type: 'TEXT',
        difficulty: 'MEDIUM',
        creatorId: 'creator-123',
        isActive: true,
        expiresAt: null,
        createdAt: new Date(),
        decryptionCount: 5,
        successfulDecryptions: 2,
        hints: ['提示1'],
        tags: ['测试'],
        aiGenerated: false,
        creator: {
          id: 'creator-123',
          displayName: '创建者',
          avatarUrl: null
        }
      };

      mockClueRepository.findById.mockResolvedValue(mockClue as any);

      const result = await clueService.getClueById(mockClueId, mockUserId);

      expect(mockClueRepository.findById).toHaveBeenCalledWith(mockClueId);
      expect(result).toBeTruthy();
      expect(result?.id).toBe(mockClueId);
    });

    it('当线索不存在时应该返回null', async () => {
      mockClueRepository.findById.mockResolvedValue(null);

      const result = await clueService.getClueById(mockClueId, mockUserId);

      expect(result).toBeNull();
    });

    it('当线索已过期时应该返回null', async () => {
      const expiredClue = {
        id: mockClueId,
        expiresAt: new Date(Date.now() - 1000), // 1秒前过期
        isActive: true
      };

      mockClueRepository.findById.mockResolvedValue(expiredClue as any);

      const result = await clueService.getClueById(mockClueId, mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('attemptDecryption', () => {
    const mockUserId = 'user-123';
    const mockClueId = 'clue-123';
    const mockAttemptData = {
      answer: '正确答案',
      hintsUsed: 1
    };

    it('应该成功解密线索', async () => {
      const mockClue = {
        id: mockClueId,
        creatorId: 'creator-123',
        isActive: true,
        expiresAt: null,
        difficulty: 'MEDIUM',
        solution: 'hashed-solution',
        hints: ['提示1', '提示2']
      };

      mockClueRepository.findById.mockResolvedValue(mockClue as any);
      mockClueRepository.hasUserSolvedClue.mockResolvedValue(false);
      mockClueRepository.getUserDecryptionAttempts.mockResolvedValue([]);
      mockClueRepository.incrementDecryptionCount.mockResolvedValue();
      mockClueRepository.createDecryptionAttempt.mockResolvedValue({} as any);
      mockClueRepository.incrementSuccessfulDecryptions.mockResolvedValue();

      // Mock bcrypt.compare to return true
      const bcrypt = require('bcryptjs');
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      const result = await clueService.attemptDecryption(mockUserId, mockClueId, mockAttemptData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('恭喜！解密成功！');
      expect(result.chatRoomId).toBeTruthy();
    });

    it('当线索不存在时应该抛出错误', async () => {
      mockClueRepository.findById.mockResolvedValue(null);

      await expect(
        clueService.attemptDecryption(mockUserId, mockClueId, mockAttemptData)
      ).rejects.toThrow('线索不存在或已失效');
    });

    it('当尝试解密自己的线索时应该抛出错误', async () => {
      const mockClue = {
        id: mockClueId,
        creatorId: mockUserId, // 同一个用户
        isActive: true,
        expiresAt: null
      };

      mockClueRepository.findById.mockResolvedValue(mockClue as any);

      await expect(
        clueService.attemptDecryption(mockUserId, mockClueId, mockAttemptData)
      ).rejects.toThrow('不能解密自己创建的线索');
    });

    it('当已经成功解密过时应该抛出错误', async () => {
      const mockClue = {
        id: mockClueId,
        creatorId: 'creator-123',
        isActive: true,
        expiresAt: null
      };

      mockClueRepository.findById.mockResolvedValue(mockClue as any);
      mockClueRepository.hasUserSolvedClue.mockResolvedValue(true);

      await expect(
        clueService.attemptDecryption(mockUserId, mockClueId, mockAttemptData)
      ).rejects.toThrow('您已经成功解密过这个线索');
    });

    it('解密失败时应该返回失败结果', async () => {
      const mockClue = {
        id: mockClueId,
        creatorId: 'creator-123',
        isActive: true,
        expiresAt: null,
        difficulty: 'MEDIUM',
        solution: 'hashed-solution',
        hints: ['提示1', '提示2']
      };

      mockClueRepository.findById.mockResolvedValue(mockClue as any);
      mockClueRepository.hasUserSolvedClue.mockResolvedValue(false);
      mockClueRepository.getUserDecryptionAttempts.mockResolvedValue([]);
      mockClueRepository.incrementDecryptionCount.mockResolvedValue();
      mockClueRepository.createDecryptionAttempt.mockResolvedValue({} as any);

      // Mock bcrypt.compare to return false
      const bcrypt = require('bcryptjs');
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const result = await clueService.attemptDecryption(mockUserId, mockClueId, mockAttemptData);

      expect(result.success).toBe(false);
      expect(result.attemptsRemaining).toBe(2); // MEDIUM difficulty allows 3 attempts
    });
  });

  describe('updateClue', () => {
    const mockClueId = 'clue-123';
    const mockCreatorId = 'creator-123';
    const mockUpdateData = {
      title: '更新的标题',
      difficulty: DifficultyLevel.HARD
    };

    it('应该成功更新线索', async () => {
      const mockExistingClue = {
        id: mockClueId,
        creatorId: mockCreatorId,
        title: '原标题'
      };

      const mockUpdatedClue = {
        ...mockExistingClue,
        ...mockUpdateData,
        creator: {
          id: mockCreatorId,
          displayName: '创建者'
        }
      };

      mockClueRepository.findById.mockResolvedValue(mockExistingClue as any);
      mockClueRepository.update.mockResolvedValue(mockUpdatedClue as any);

      const result = await clueService.updateClue(mockClueId, mockCreatorId, mockUpdateData);

      expect(result?.title).toBe(mockUpdateData.title);
      expect(result?.difficulty).toBe(mockUpdateData.difficulty);
    });

    it('当线索不属于当前用户时应该抛出错误', async () => {
      const mockExistingClue = {
        id: mockClueId,
        creatorId: 'other-creator', // 不同的创建者
        title: '原标题'
      };

      mockClueRepository.findById.mockResolvedValue(mockExistingClue as any);

      await expect(
        clueService.updateClue(mockClueId, mockCreatorId, mockUpdateData)
      ).rejects.toThrow('线索不存在或无权限修改');
    });
  });

  describe('deleteClue', () => {
    const mockClueId = 'clue-123';
    const mockCreatorId = 'creator-123';

    it('应该成功删除线索', async () => {
      const mockExistingClue = {
        id: mockClueId,
        creatorId: mockCreatorId
      };

      mockClueRepository.findById.mockResolvedValue(mockExistingClue as any);
      mockClueRepository.softDelete.mockResolvedValue(true);

      const result = await clueService.deleteClue(mockClueId, mockCreatorId);

      expect(result).toBe(true);
      expect(mockClueRepository.softDelete).toHaveBeenCalledWith(mockClueId);
    });

    it('当线索不属于当前用户时应该抛出错误', async () => {
      const mockExistingClue = {
        id: mockClueId,
        creatorId: 'other-creator'
      };

      mockClueRepository.findById.mockResolvedValue(mockExistingClue as any);

      await expect(
        clueService.deleteClue(mockClueId, mockCreatorId)
      ).rejects.toThrow('线索不存在或无权限删除');
    });
  });
});