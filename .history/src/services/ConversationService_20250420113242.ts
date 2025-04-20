/**
 * 对话服务
 * 负责处理用户和AI助手之间的对话
 */

import { Message } from '../types';

// 模拟API调用延迟
const FAKE_API_DELAY = 800;

/**
 * 发送消息给AI并获取响应
 * @param message 用户消息
 * @returns AI的响应消息
 */
export async function sendMessageToAI(message: string): Promise<Message> {
  try {
    // 在实际项目中，这里应该调用真实的AI API
    // 现在只是模拟一个延迟和简单的回复
    
    await new Promise(resolve => setTimeout(resolve, FAKE_API_DELAY));
    
    // 简单的模拟响应
    const response: Message = {
      id: Date.now().toString(),
      content: generateAIResponse(message),
      type: 'assistant',
      timestamp: Date.now(),
      status: 'sent',
    };
    
    return response;
  } catch (error) {
    console.error('发送消息到AI出错:', error);
    
    // 返回错误消息
    return {
      id: Date.now().toString(),
      content: '抱歉，我遇到了一些问题，无法处理您的请求。',
      type: 'assistant',
      timestamp: Date.now(),
      status: 'error',
    };
  }
}

/**
 * 简单的模拟AI响应生成
 * @param userMessage 用户消息
 * @returns 模拟的AI响应
 */
function generateAIResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // 简单的问候检测
  if (lowerMessage.includes('你好') || lowerMessage.includes('嗨') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
    return '你好！我是你的AI助手，有什么我可以帮助你的吗？';
  }
  
  // 询问天气
  if (lowerMessage.includes('天气')) {
    return '抱歉，我目前无法获取实时天气数据。您可以通过手机的天气应用查看最新天气预报。';
  }
  
  // 询问时间
  if (lowerMessage.includes('时间') || lowerMessage.includes('几点')) {
    const now = new Date();
    return `现在的时间是 ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}。`;
  }
  
  // 默认响应
  return `我收到了你的消息: "${userMessage}"。请问还有什么我可以帮助你的吗？`;
}

/**
 * 更新消息状态
 * @param messageId 消息ID
 * @param status 新状态
 * @param messages 当前消息列表
 * @returns 更新后的消息列表
 */
export function updateMessageStatus(
  messageId: string,
  status: Message['status'],
  messages: Message[]
): Message[] {
  return messages.map(msg => 
    msg.id === messageId ? { ...msg, status } : msg
  );
}

/**
 * 创建用户消息对象
 * @param content 消息内容
 * @returns 用户消息对象
 */
export function createUserMessage(content: string): Message {
  return {
    id: Date.now().toString(),
    content,
    type: 'user',
    timestamp: Date.now(),
    status: 'sending',
  };
} 