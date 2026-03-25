/**
 * Socket.IO 事件类型定义
 */

// 客户端发送的事件
export interface ClientToServerEvents {
  // 加入聊天房间
  join_chat_room: (data: { roomId: string }) => void;
  
  // 离开聊天房间
  leave_chat_room: (data: { roomId: string }) => void;
  
  // 发送消息
  send_message: (data: {
    roomId: string;
    content: MessageContent;
    type: MessageType;
    tempId?: string; // 客户端临时ID
  }) => void;
  
  // 输入状态
  typing_start: (data: { roomId: string }) => void;
  typing_stop: (data: { roomId: string }) => void;
  
  // 标记消息已读
  mark_as_read: (data: { roomId: string; messageIds: string[] }) => void;
  
  // 检查用户在线状态
  check_user_online: (data: { userId: string }) => void;
}

// 服务器发送的事件
export interface ServerToClientEvents {
  // 用户上线
  user_online: (data: { userId: string; timestamp: string }) => void;
  
  // 用户离线
  user_offline: (data: { userId: string; timestamp: string }) => void;
  
  // 用户加入房间
  user_joined_room: (data: { userId: string; roomId: string; timestamp: string }) => void;
  
  // 用户离开房间
  user_left_room: (data: { userId: string; roomId: string; timestamp: string }) => void;
  
  // 加入房间成功
  joined_room_success: (data: { roomId: string }) => void;
  
  // 新消息
  new_message: (data: {
    id: string;
    content: MessageContent;
    type: MessageType;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    sentAt: Date;
    roomId: string;
    isEncrypted: boolean;
  }) => void;
  
  // 消息发送成功确认
  message_sent: (data: {
    id: string;
    tempId?: string;
    sentAt: Date;
  }) => void;
  
  // 消息已读
  messages_read: (data: {
    roomId: string;
    messageIds: string[];
    readBy: string;
    readAt: Date;
  }) => void;
  
  // 用户正在输入
  user_typing_start: (data: { userId: string; roomId: string }) => void;
  
  // 用户停止输入
  user_typing_stop: (data: { userId: string; roomId: string }) => void;
  
  // 用户在线状态
  user_online_status: (data: { userId: string; isOnline: boolean }) => void;
  
  // 错误
  error: (data: { message: string; tempId?: string }) => void;
}

// 消息内容类型
export interface MessageContent {
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  emoji?: string;
  systemMessage?: string;
  aiSuggestion?: string;
}

// 消息类型
export type MessageType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'EMOJI' | 'SYSTEM';

// Socket 数据
export interface SocketData {
  userId: string;
  anonymousId: string;
}
