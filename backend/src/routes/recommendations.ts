import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// 获取推荐线索
router.get('/clues', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: '推荐线索功能待实现',
    data: []
  });
});

// 获取热门线索
router.get('/trending', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: '热门线索功能待实现',
    data: []
  });
});

// 获取个性化推荐
router.get('/personalized', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: '个性化推荐功能待实现',
    data: []
  });
});

export default router;