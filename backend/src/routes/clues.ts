import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { clueCreationLimiter, decryptionLimiter } from '../middleware/rateLimiter';
import { ClueService } from '../services/clueService';
import { PrismaClient } from '@prisma/client';
import { CreateClueRequest, UpdateClueRequest, DecryptionAttemptRequest } from '../types/clue';

const router = Router();
const prisma = new PrismaClient();
const clueService = new ClueService(prisma);

// 创建线索
router.post('/', requireAuth, clueCreationLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const anonymousIdentity = user?.anonymousIdentities?.[0];
    const userId = anonymousIdentity?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户身份验证失败'
      });
      return;
    }

    const clueData: CreateClueRequest = req.body;
    const clue = await clueService.createClue(userId, clueData);

    res.status(201).json({
      success: true,
      message: '线索创建成功',
      data: clue
    });
  } catch (error) {
    console.error('创建线索失败:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : '创建线索失败'
    });
  }
});

// 获取线索池（发现页面）
router.get('/pool', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const anonymousIdentity = user?.anonymousIdentities?.[0];
    const userId = anonymousIdentity?.id;

    const query = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      type: req.query.type as any,
      difficulty: req.query.difficulty as any,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string || 'latest',
      excludeOwn: true,
      currentUserId: userId
    };

    const result = await clueService.getCluePool(query);

    res.json({
      success: true,
      message: '获取线索池成功',
      data: result
    });
  } catch (error) {
    console.error('获取线索池失败:', error);
    res.status(500).json({
      success: false,
      message: '获取线索池失败'
    });
  }
});

// 获取热门线索
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const anonymousIdentity = user?.anonymousIdentities?.[0];
    const userId = anonymousIdentity?.id;

    const query = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      timeRange: req.query.timeRange as string || 'all',  // 默认显示所有时间的热门线索
      currentUserId: userId
    };

    const result = await clueService.getTrendingClues(query);

    res.json({
      success: true,
      message: '获取热门线索成功',
      data: result
    });
  } catch (error) {
    console.error('获取热门线索失败:', error);
    res.status(500).json({
      success: false,
      message: '获取热门线索失败'
    });
  }
});

// 获取线索分类和标签统计
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await clueService.getClueCategories();

    res.json({
      success: true,
      message: '获取线索分类成功',
      data: categories
    });
  } catch (error) {
    console.error('获取线索分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取线索分类失败'
    });
  }
});

// 搜索线索
router.get('/search', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const anonymousIdentity = user?.anonymousIdentities?.[0];
    const userId = anonymousIdentity?.id;

    const query = {
      keyword: req.query.q as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      type: req.query.type as any,
      difficulty: req.query.difficulty as any,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      sortBy: req.query.sortBy as string || 'relevance',
      currentUserId: userId
    };

    if (!query.keyword || query.keyword.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
      return;
    }

    const result = await clueService.searchClues(query);

    res.json({
      success: true,
      message: '搜索线索成功',
      data: result
    });
  } catch (error) {
    console.error('搜索线索失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索线索失败'
    });
  }
});

// 获取用户解密统计
router.get('/stats/decryption', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const anonymousIdentity = user?.anonymousIdentities?.[0];
    const userId = anonymousIdentity?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户身份验证失败'
      });
      return;
    }

    const stats = await clueService.getUserDecryptionStats(userId);

    res.json({
      success: true,
      message: '获取解密统计成功',
      data: stats
    });
  } catch (error) {
    console.error('获取解密统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取解密统计失败'
    });
  }
});

// 获取线索列表
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      type: req.query.type as any,
      difficulty: req.query.difficulty as any,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      search: req.query.search as string,
      creatorId: req.query.creatorId as string,
      isActive: req.query.isActive !== 'false'
    };

    const result = await clueService.getClues(query);

    res.json({
      success: true,
      message: '获取线索列表成功',
      data: result
    });
  } catch (error) {
    console.error('获取线索列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取线索列表失败'
    });
  }
});

// 获取单个线索
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    const anonymousIdentity = user?.anonymousIdentities?.[0];
    const userId = anonymousIdentity?.id;
    
    const clue = await clueService.getClueById(id, userId);

    if (!clue) {
      res.status(404).json({
        success: false,
        message: '线索不存在或已过期'
      });
      return;
    }

    res.json({
      success: true,
      message: '获取线索详情成功',
      data: clue
    });
  } catch (error) {
    console.error('获取线索详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取线索详情失败'
    });
  }
});

// 尝试解密线索
router.post('/:id/decrypt', requireAuth, decryptionLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    const anonymousIdentity = user?.anonymousIdentities?.[0];
    const userId = anonymousIdentity?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户身份验证失败'
      });
      return;
    }

    const attemptData: DecryptionAttemptRequest = req.body;
    const result = await clueService.attemptDecryption(userId, id, attemptData);

    res.json({
      success: true,
      message: '解密尝试完成',
      data: result
    });
  } catch (error) {
    console.error('解密尝试失败:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : '解密尝试失败'
    });
  }
});

// 更新线索
router.put('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    const anonymousIdentity = user?.anonymousIdentities?.[0];
    const userId = anonymousIdentity?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户身份验证失败'
      });
      return;
    }

    const updateData: UpdateClueRequest = req.body;
    const clue = await clueService.updateClue(id, userId, updateData);

    if (!clue) {
      res.status(404).json({
        success: false,
        message: '线索不存在或更新失败'
      });
      return;
    }

    res.json({
      success: true,
      message: '线索更新成功',
      data: clue
    });
  } catch (error) {
    console.error('更新线索失败:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : '更新线索失败'
    });
  }
});

// 删除线索
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    const anonymousIdentity = user?.anonymousIdentities?.[0];
    const userId = anonymousIdentity?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户身份验证失败'
      });
      return;
    }

    const success = await clueService.deleteClue(id, userId);

    if (!success) {
      res.status(404).json({
        success: false,
        message: '线索不存在或删除失败'
      });
      return;
    }

    res.json({
      success: true,
      message: '线索删除成功'
    });
  } catch (error) {
    console.error('删除线索失败:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : '删除线索失败'
    });
  }
});

export default router;