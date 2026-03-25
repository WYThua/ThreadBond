import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getRedisService, getRedisClient } from './redis';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  anonymousId?: string;
}

export function setupSocketIO(io: Server) {
  // Socket.IO 认证中间件
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('认证令牌缺失'));
      }

      // 验证 JWT
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'threadbond_jwt_secret_key_2024_very_secure'
      ) as any;

      // 获取用户信息
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { anonymousIdentities: true }
      });

      if (!user || !user.isActive) {
        return next(new Error('用户不存在或已被禁用'));
      }

      // 将用户信息附加到 socket
      socket.userId = user.id;
      socket.anonymousId = user.anonymousIdentities[0]?.id;
      
      next();
    } catch (error) {
      next(new Error('认证失败'));
    }
  });

  // 连接处理
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`用户连接: ${socket.userId} (匿名ID: ${socket.anonymousId})`);

    // 用户上线状态
    handleUserOnline(socket);

    // 加入聊天房间
    socket.on('join_chat_room', async (data) => {
      await handleJoinChatRoom(socket, data);
    });

    // 发送消息
    socket.on('send_message', async (data) => {
      await handleSendMessage(socket, io, data);
    });

    // 离开聊天房间
    socket.on('leave_chat_room', async (data) => {
      await handleLeaveChatRoom(socket, data);
    });

    // 输入状态
    socket.on('typing_start', (data) => {
      handleTypingStart(socket, data);
    });

    socket.on('typing_stop', (data) => {
      handleTypingStop(socket, data);
    });

    // 消息已读回执
    socket.on('mark_as_read', async (data) => {
      await handleMarkAsRead(socket, io, data);
    });

    // 获取在线状态
    socket.on('check_user_online', async (data) => {
      await handleCheckUserOnline(socket, data);
    });

    // 断开连接
    socket.on('disconnect', () => {
      handleUserOffline(socket);
      console.log(`用户断开连接: ${socket.userId}`);
    });
  });
}

// 处理用户上线
async function handleUserOnline(socket: AuthenticatedSocket) {
  if (!socket.userId) return;

  try {
    // 尝试更新用户在线状态（如果 Redis 可用）
    const redisClient = getRedisClient();
    if (redisClient) {
      await getRedisService().set(`user:online:${socket.userId}`, {
        socketId: socket.id,
        connectedAt: new Date().toISOString()
      }, 3600); // 1小时过期
      console.log(`✅ 用户在线状态已保存到 Redis: ${socket.userId}`);
    } else {
      console.log(`⚠️ Redis 不可用，跳过在线状态保存: ${socket.userId}`);
    }
  } catch (error) {
    console.error('❌ 保存用户在线状态失败:', error);
  }

  // 通知相关用户
  socket.broadcast.emit('user_online', {
    userId: socket.anonymousId,
    timestamp: new Date().toISOString()
  });
}

// 处理用户离线
async function handleUserOffline(socket: AuthenticatedSocket) {
  if (!socket.userId) return;

  try {
    // 尝试移除在线状态（如果 Redis 可用）
    const redisClient = getRedisClient();
    if (redisClient) {
      await getRedisService().del(`user:online:${socket.userId}`);
      console.log(`✅ 用户离线状态已从 Redis 移除: ${socket.userId}`);
    } else {
      console.log(`⚠️ Redis 不可用，跳过离线状态移除: ${socket.userId}`);
    }
  } catch (error) {
    console.error('❌ 移除用户离线状态失败:', error);
  }

  // 通知相关用户
  socket.broadcast.emit('user_offline', {
    userId: socket.anonymousId,
    timestamp: new Date().toISOString()
  });
}

// 处理加入聊天房间
async function handleJoinChatRoom(socket: AuthenticatedSocket, data: { roomId: string }) {
  try {
    const { roomId } = data;

    // 验证用户是否有权限加入此房间
    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { participant1Id: socket.anonymousId },
          { participant2Id: socket.anonymousId }
        ],
        isActive: true
      }
    });

    if (!chatRoom) {
      socket.emit('error', { message: '无权限加入此聊天房间' });
      return;
    }

    // 加入 Socket.IO 房间
    socket.join(roomId);

    // 缓存用户当前房间
    await getRedisService().set(`user:current_room:${socket.userId}`, roomId, 3600);

    // 通知房间内其他用户
    socket.to(roomId).emit('user_joined_room', {
      userId: socket.anonymousId,
      roomId,
      timestamp: new Date().toISOString()
    });

    socket.emit('joined_room_success', { roomId });

  } catch (error) {
    console.error('加入聊天房间失败:', error);
    socket.emit('error', { message: '加入聊天房间失败' });
  }
}

// 处理发送消息
async function handleSendMessage(socket: AuthenticatedSocket, io: Server, data: any) {
  try {
    const { roomId, content, type = 'TEXT' } = data;

    // 验证消息内容
    if (!content || Object.keys(content).length === 0) {
      socket.emit('error', { message: '消息内容不能为空' });
      return;
    }

    // 验证消息类型
    const validTypes = ['TEXT', 'IMAGE', 'EMOJI', 'AUDIO', 'SYSTEM'];
    if (!validTypes.includes(type)) {
      socket.emit('error', { message: '不支持的消息类型' });
      return;
    }

    // 验证房间权限
    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { participant1Id: socket.anonymousId },
          { participant2Id: socket.anonymousId }
        ],
        isActive: true
      }
    });

    if (!chatRoom) {
      socket.emit('error', { message: '无权限在此房间发送消息' });
      return;
    }

    // 根据消息类型验证内容
    if (type === 'TEXT' && (!content.text || content.text.trim().length === 0)) {
      socket.emit('error', { message: '文字消息内容不能为空' });
      return;
    }

    if (type === 'IMAGE' && !content.imageUrl) {
      socket.emit('error', { message: '图片消息必须包含图片URL' });
      return;
    }

    if (type === 'EMOJI' && !content.emoji) {
      socket.emit('error', { message: '表情消息必须包含表情' });
      return;
    }

    // 创建消息记录
    const message = await prisma.message.create({
      data: {
        roomId,
        senderId: socket.anonymousId!,
        content,
        type,
        isEncrypted: false // 后续实现端到端加密
      },
      include: {
        sender: true
      }
    });

    // 更新聊天房间最后消息时间
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { lastMessageAt: new Date() }
    });

    // 缓存最新消息
    try {
      await getRedisService().lPush(`room:messages:${roomId}`, message);
      
      // 只保留最近100条消息在缓存中
      const messageCount = await getRedisService().lRange(`room:messages:${roomId}`, 0, -1);
      if (messageCount.length > 100) {
        // 移除多余的消息
        for (let i = 100; i < messageCount.length; i++) {
          await getRedisService().lPop(`room:messages:${roomId}`);
        }
      }

      // 设置缓存过期时间（24小时）
      await getRedisService().expire(`room:messages:${roomId}`, 86400);
    } catch (cacheError) {
      console.error('缓存消息失败:', cacheError);
      // 不影响消息发送
    }

    // 广播消息到房间内所有用户
    io.to(roomId).emit('new_message', {
      id: message.id,
      content: message.content,
      type: message.type,
      senderId: message.senderId,
      senderName: message.sender.displayName,
      senderAvatar: message.sender.avatarUrl,
      sentAt: message.sentAt,
      roomId,
      isEncrypted: message.isEncrypted
    });

    // 发送确认给发送者
    socket.emit('message_sent', {
      id: message.id,
      tempId: data.tempId, // 客户端临时ID，用于匹配
      sentAt: message.sentAt
    });

  } catch (error) {
    console.error('发送消息失败:', error);
    socket.emit('error', { 
      message: '发送消息失败',
      tempId: data.tempId // 返回临时ID，让客户端知道哪条消息失败
    });
  }
}

// 处理离开聊天房间
async function handleLeaveChatRoom(socket: AuthenticatedSocket, data: { roomId: string }) {
  const { roomId } = data;

  // 离开 Socket.IO 房间
  socket.leave(roomId);

  // 清除当前房间缓存
  await getRedisService().del(`user:current_room:${socket.userId}`);

  // 通知房间内其他用户
  socket.to(roomId).emit('user_left_room', {
    userId: socket.anonymousId,
    roomId,
    timestamp: new Date().toISOString()
  });
}

// 处理输入状态
function handleTypingStart(socket: AuthenticatedSocket, data: { roomId: string }) {
  socket.to(data.roomId).emit('user_typing_start', {
    userId: socket.anonymousId,
    roomId: data.roomId
  });
}

function handleTypingStop(socket: AuthenticatedSocket, data: { roomId: string }) {
  socket.to(data.roomId).emit('user_typing_stop', {
    userId: socket.anonymousId,
    roomId: data.roomId
  });
}

// 处理消息已读
async function handleMarkAsRead(socket: AuthenticatedSocket, io: Server, data: { roomId: string; messageIds: string[] }) {
  try {
    const { roomId, messageIds } = data;

    if (!messageIds || messageIds.length === 0) {
      return;
    }

    // 批量标记消息为已读
    await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        roomId,
        senderId: { not: socket.anonymousId }, // 只能标记别人发送的消息
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    // 通知发送者消息已被阅读
    socket.to(roomId).emit('messages_read', {
      roomId,
      messageIds,
      readBy: socket.anonymousId,
      readAt: new Date()
    });

  } catch (error) {
    console.error('标记消息已读失败:', error);
  }
}

// 检查用户在线状态
async function handleCheckUserOnline(socket: AuthenticatedSocket, data: { userId: string }) {
  try {
    const { userId } = data;
    const redisClient = getRedisClient();
    
    if (!redisClient) {
      socket.emit('user_online_status', {
        userId,
        isOnline: false
      });
      return;
    }

    const onlineData = await getRedisService().get(`user:online:${userId}`);
    
    socket.emit('user_online_status', {
      userId,
      isOnline: !!onlineData
    });

  } catch (error) {
    console.error('检查用户在线状态失败:', error);
    socket.emit('user_online_status', {
      userId: data.userId,
      isOnline: false
    });
  }
}