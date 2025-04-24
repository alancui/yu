import { mcpClientBridge, McpError, McpEventType, McpResponse } from './mcpBridge';

/**
 * 日历事件接口
 */
export interface CalendarEvent {
  title: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  location?: string;
  description?: string;
  attendees?: string[];
}

/**
 * 提醒项接口
 */
export interface ReminderItem {
  title: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  isCompleted?: boolean;
  notes?: string;
}

/**
 * 笔记接口
 */
export interface Note {
  title: string;
  content: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * MCP服务类
 * 提供高级API接口，用于与特定MCP服务通信
 */
export class McpService {
  private isConnecting: boolean = false;
  private lastConnectedUrl: string | null = null;
  
  /**
   * 构造函数
   */
  constructor() {
    // 监听连接状态变更
    mcpClientBridge.on(McpEventType.ConnectionState, (state) => {
      if (!state.connected && this.lastConnectedUrl) {
        // 如果连接断开，并且不在连接过程中，尝试重新连接
        if (!this.isConnecting) {
          this.reconnect();
        }
      }
    });
    
    // 监听错误
    mcpClientBridge.on(McpEventType.Error, (error) => {
      console.error('MCP服务错误:', error);
    });
  }
  
  /**
   * 重新连接到MCP服务器
   */
  private async reconnect(): Promise<void> {
    if (!this.lastConnectedUrl || this.isConnecting) return;
    
    this.isConnecting = true;
    try {
      console.log('尝试重新连接到MCP服务器...');
      await mcpClientBridge.connect(this.lastConnectedUrl);
    } catch (error) {
      console.error('重新连接失败:', error);
    } finally {
      this.isConnecting = false;
    }
  }
  
  /**
   * 连接到MCP服务器
   * @param serverUrl MCP服务器URL
   */
  async connect(serverUrl: string): Promise<boolean> {
    try {
      this.isConnecting = true;
      const connected = await mcpClientBridge.connect(serverUrl);
      if (connected) {
        this.lastConnectedUrl = serverUrl;
      }
      return connected;
    } catch (error) {
      console.error('连接MCP服务器失败:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }
  
  /**
   * 断开与MCP服务器的连接
   */
  async disconnect(): Promise<boolean> {
    this.lastConnectedUrl = null;
    return await mcpClientBridge.disconnect();
  }
  
  /**
   * 检查是否已连接
   */
  async isConnected(): Promise<boolean> {
    return await mcpClientBridge.isConnected();
  }
  
  /**
   * 创建日历事件
   * @param event 日历事件信息
   */
  async createCalendarEvent(event: CalendarEvent): Promise<boolean> {
    try {
      const response = await mcpClientBridge.callTool('createCalendarEvent', event);
      
      // 检查响应
      if (response.content?.[0]?.type === 'error') {
        throw new McpError('calendar_event_creation_failed', response.content[0].text || '创建日历事件失败');
      }
      
      return true;
    } catch (error) {
      console.error('创建日历事件失败:', error);
      throw error;
    }
  }
  
  /**
   * 创建提醒项
   * @param reminder 提醒项信息
   */
  async createReminder(reminder: ReminderItem): Promise<boolean> {
    try {
      const response = await mcpClientBridge.callTool('createReminder', reminder);
      
      // 检查响应
      if (response.content?.[0]?.type === 'error') {
        throw new McpError('reminder_creation_failed', response.content[0].text || '创建提醒失败');
      }
      
      return true;
    } catch (error) {
      console.error('创建提醒失败:', error);
      throw error;
    }
  }
  
  /**
   * 创建笔记
   * @param note 笔记信息
   */
  async createNote(note: Note): Promise<boolean> {
    try {
      const response = await mcpClientBridge.callTool('createNote', note);
      
      // 检查响应
      if (response.content?.[0]?.type === 'error') {
        throw new McpError('note_creation_failed', response.content[0].text || '创建笔记失败');
      }
      
      return true;
    } catch (error) {
      console.error('创建笔记失败:', error);
      throw error;
    }
  }
  
  /**
   * 分析用户输入并执行适当的操作
   * @param text 用户输入文本
   */
  async processUserInput(text: string): Promise<McpResponse> {
    try {
      return await mcpClientBridge.callTool('processUserInput', { text });
    } catch (error) {
      console.error('处理用户输入失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取可用MCP工具列表
   */
  async getAvailableTools(): Promise<string[]> {
    try {
      const serverInfo = await mcpClientBridge.getServerInfo();
      return serverInfo?.tools.map(tool => tool.name) || [];
    } catch (error) {
      console.error('获取可用工具列表失败:', error);
      return [];
    }
  }
  
  /**
   * 清理资源
   */
  cleanup(): void {
    this.lastConnectedUrl = null;
    mcpClientBridge.removeAllListeners();
  }
}

// 导出单例实例
export const mcpService = new McpService();

// 高阶API接口 - 快捷操作
export async function createEvent(title: string, startTime: string, duration: number = 60): Promise<boolean> {
  return await mcpService.createCalendarEvent({
    title,
    startTime,
    duration
  });
}

export async function createReminder(title: string, dueDate?: string): Promise<boolean> {
  return await mcpService.createReminder({
    title,
    dueDate
  });
}

export async function createNote(title: string, content: string): Promise<boolean> {
  return await mcpService.createNote({
    title,
    content,
    createdAt: new Date().toISOString()
  });
} 