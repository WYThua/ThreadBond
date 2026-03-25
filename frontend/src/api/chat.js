import request from './index';

/**
 * 聊天相关 API
 */

// 创建聊天房间
export function createChatRoom(data) {
  return request({
    url: '/chat/rooms',
    method: 'post',
    data
  });
}

// 获取用户的聊天房间列表
export function getChatRooms() {
  return request({
    url: '/chat/rooms',
    method: 'get'
  });
}

// 获取聊天房间详情
export function getChatRoomById(roomId) {
  return request({
    url: `/chat/rooms/${roomId}`,
    method: 'get'
  });
}

// 获取聊天历史
export function getChatHistory(roomId, params = {}) {
  return request({
    url: `/chat/rooms/${roomId}/messages`,
    method: 'get',
    params
  });
}

// 发送消息（HTTP 方式，WebSocket 为主）
export function sendMessage(roomId, data) {
  return request({
    url: `/chat/rooms/${roomId}/messages`,
    method: 'post',
    data
  });
}

// 标记消息为已读
export function markMessagesAsRead(roomId) {
  return request({
    url: `/chat/rooms/${roomId}/read`,
    method: 'post'
  });
}

// 获取聊天房间统计信息
export function getChatRoomStats(roomId) {
  return request({
    url: `/chat/rooms/${roomId}/stats`,
    method: 'get'
  });
}

// 结束聊天
export function endChat(roomId) {
  return request({
    url: `/chat/rooms/${roomId}/end`,
    method: 'post'
  });
}

// 身份揭示
export function revealIdentity(roomId) {
  return request({
    url: `/chat/rooms/${roomId}/reveal`,
    method: 'post'
  });
}

// 删除聊天房间
export function deleteChatRoom(roomId) {
  return request({
    url: `/chat/rooms/${roomId}`,
    method: 'delete'
  });
}
