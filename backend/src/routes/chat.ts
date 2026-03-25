import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { messageLimiter } from '../middleware/rateLimiter';
import { chatService } from '../services/chatService';

const router = Router();

// 创建聊天房间
router.post('/rooms', requireAuth, async (req: Request, res: Response) => {
  try {
    const { participant2Id, clueId } = req.body;
    const participant1Id = req.user?.anonymousId;

    if (!participant1Id) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    if (!participant2Id || !clueId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    const chatRoom = await chatService.createChatRoom(
      participant1Id,
      participant2Id,
      clueId
    );

    res.status(201).json({
      success: true,
      message: '聊天房间创建成功',
      data: chatRoom
    });
  } catch (error: any) {
    console.error('创建聊天房间失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '创建聊天房间失败'
    });
  }
});

// 获取用户的聊天房间列表
router.get('/rooms', requireAuth, async (req: Request, res: Response) => {
  try {
    const anonymousId = req.user?.anonymousId;

    if (!anonymousId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const chatRooms = await chatService.getUserChatRooms(anonymousId);

    res.json({
      success: true,
      message: '获取聊天房间列表成功',
      data: chatRooms
    });
  } catch (error: any) {
    console.error('获取聊天房间列表失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取聊天房间列表失败'
    });
  }
});

// 获取聊天房间详情
router.get('/rooms/:roomId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const anonymousId = req.user?.anonymousId;

    if (!anonymousId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    // 验证权限
    const hasAccess = await chatService.validateRoomAccess(roomId, anonymousId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: '无权限访问此聊天房间'
      });
    }

    const chatRoom = await chatService.getChatRoomById(roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: '聊天房间不存在'
      });
    }

    res.json({
      success: true,
      message: '获取聊天房间详情成功',
      data: chatRoom
    });
  } catch (error: any) {
    console.error('获取聊天房间详情失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取聊天房间详情失败'
    });
  }
});

// 获取聊天历史
router.get('/rooms/:roomId/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const anonymousId = req.user?.anonymousId;
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before ? new Date(req.query.before as string) : undefined;

    if (!anonymousId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const messages = await chatService.getChatHistory(roomId, anonymousId, limit, before);

    res.json({
      success: true,
      message: '获取聊天历史成功',
      data: messages
    });
  } catch (error: any) {
    console.error('获取聊天历史失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取聊天历史失败'
    });
  }
});

// 发送消息（HTTP接口，WebSocket为主要方式）
router.post('/rooms/:roomId/messages', requireAuth, messageLimiter, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { content, type = 'TEXT' } = req.body;
    const senderId = req.user?.anonymousId;

    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: '消息内容不能为空'
      });
    }

    const message = await chatService.sendMessage(roomId, senderId, content, type);

    res.status(201).json({
      success: true,
      message: '消息发送成功',
      data: message
    });
  } catch (error: any) {
    console.error('发送消息失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '发送消息失败'
    });
  }
});

// 标记消息为已读
router.post('/rooms/:roomId/read', requireAuth, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.anonymousId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const count = await chatService.markMessagesAsRead(roomId, userId);

    res.json({
      success: true,
      message: '消息已标记为已读',
      data: { count }
    });
  } catch (error: any) {
    console.error('标记消息已读失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '标记消息已读失败'
    });
  }
});

// 获取聊天房间统计信息
router.get('/rooms/:roomId/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.anonymousId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const stats = await chatService.getChatRoomStats(roomId, userId);

    res.json({
      success: true,
      message: '获取统计信息成功',
      data: stats
    });
  } catch (error: any) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取统计信息失败'
    });
  }
});

// 结束聊天
router.post('/rooms/:roomId/end', requireAuth, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.anonymousId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const chatRoom = await chatService.endChat(roomId, userId);

    res.json({
      success: true,
      message: '聊天已结束',
      data: chatRoom
    });
  } catch (error: any) {
    console.error('结束聊天失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '结束聊天失败'
    });
  }
});

// 身份揭示
router.post('/rooms/:roomId/reveal', requireAuth, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.anonymousId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const result = await chatService.revealIdentity(roomId, userId);

    res.json({
      success: true,
      message: result.bothRevealed ? '双方已同意揭示身份' : '已记录你的身份揭示意愿',
      data: result
    });
  } catch (error: any) {
    console.error('身份揭示失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '身份揭示失败'
    });
  }
});

// 删除聊天房间
router.delete('/rooms/:roomId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.anonymousId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    await chatService.deleteChatRoom(roomId, userId);

    res.json({
      success: true,
      message: '聊天房间已删除'
    });
  } catch (error: any) {
    console.error('删除聊天房间失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '删除聊天房间失败'
    });
  }
});

export default router;