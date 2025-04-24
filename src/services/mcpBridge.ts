import { NativeModules, NativeEventEmitter } from 'react-native';
import { EventEmitter } from 'events';

// 加载Rust MCP客户端模块
const { RustMcpClient } = NativeModules;
const McpEventEmitter = new NativeEventEmitter(RustMcpClient);

/**
 * MCP事件类型
 */
export enum McpEventType {
  ToolCall = 'toolCall',
  ResourceRequest = 'resourceRequest',
  ConnectionState = 'connectionState',
  Error = 'error',
}

/**
 * 连接状态事件
 */
export interface ConnectionStateEvent {
  connected: boolean;
  serverName?: string;
}

/**
 * 工具调用事件
 */
export interface ToolCallEvent {
  callId: string;
  name: string;
  parameters: Record<string, any>;
}

/**
 * 资源请求事件
 */
export interface ResourceRequestEvent {
  requestId: string;
  uri: string;
}

/**
 * 错误事件
 */
export interface ErrorEvent {
  code: string;
  message: string;
}

/**
 * MCP响应内容
 */
export interface McpContent {
  type: string;
  text?: string;
  [key: string]: any;
}

/**
 * MCP响应
 */
export interface McpResponse {
  content: McpContent[];
  metadata?: Record<string, any>;
}

/**
 * MCP资源内容
 */
export interface McpResourceContent {
  uri: string;
  text: string;
  mimeType?: string;
}

/**
 * MCP资源
 */
export interface McpResource {
  contents: McpResourceContent[];
  metadata?: Record<string, any>;
}

/**
 * MCP工具定义
 */
export interface McpTool {
  name: string;
  description: string;
  parametersSchema: any;
}

/**
 * MCP服务器信息
 */
export interface McpServerInfo {
  name: string;
  version: string;
  tools: McpTool[];
}

/**
 * MCP错误
 */
export class McpError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'McpError';
  }
}

/**
 * 重试配置
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  backoffFactor: number;
  maxDelayMs: number;
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 500,
  backoffFactor: 1.5,
  maxDelayMs: 5000,
};

/**
 * 延迟工具函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 检查是否是可重试的错误
 */
function isRetryableError(error: any): boolean {
  // 网络错误
  if (error?.message?.includes('network')) return true;
  
  // 超时错误
  if (error?.message?.includes('timeout')) return true;
  
  // 特定错误码 - 服务器错误
  if (error instanceof McpError && error.code.startsWith('5')) return true;
  
  return false;
}

/**
 * 通用重试函数
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  shouldRetry: (error: any) => boolean = isRetryableError
): Promise<T> {
  let lastError: any;
  let delayMs = config.initialDelayMs;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === config.maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      console.log(`重试操作 (${attempt + 1}/${config.maxRetries})...`);
      
      await delay(delayMs);
      delayMs = Math.min(delayMs * config.backoffFactor, config.maxDelayMs);
    }
  }
  
  // 应该永远不会到达这里，但为了类型检查
  throw lastError;
}

/**
 * MCP客户端桥接类
 * 负责与Rust实现的MCP客户端通信
 */
export class McpClientBridge extends EventEmitter {
  private subscriptions: any[] = [];
  private connectionState: ConnectionStateEvent = { connected: false };
  private isInitialized: boolean = false;
  private serverInfo: McpServerInfo | null = null;
  private connectionPromise: Promise<boolean> | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG;
  
  constructor() {
    super();
    this.setupEventListeners();
  }
  
  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    // 监听连接状态变更
    this.subscriptions.push(
      McpEventEmitter.addListener('mcpConnectionState', (event: string) => {
        const data = JSON.parse(event) as ConnectionStateEvent;
        this.connectionState = data;
        this.emit(McpEventType.ConnectionState, data);
      })
    );
    
    // 监听工具调用
    this.subscriptions.push(
      McpEventEmitter.addListener('mcpToolCall', (event: string) => {
        this.emit(McpEventType.ToolCall, JSON.parse(event) as ToolCallEvent);
      })
    );
    
    // 监听资源请求
    this.subscriptions.push(
      McpEventEmitter.addListener('mcpResourceRequest', (event: string) => {
        this.emit(McpEventType.ResourceRequest, JSON.parse(event) as ResourceRequestEvent);
      })
    );
    
    // 监听错误
    this.subscriptions.push(
      McpEventEmitter.addListener('mcpError', (event: string) => {
        const data = JSON.parse(event) as ErrorEvent;
        this.emit(McpEventType.Error, data);
        
        // 如果是连接错误，可能需要尝试重新连接
        if (data.code === 'connection_lost' && this.connectionState.connected) {
          this.handleConnectionLost();
        }
      })
    );
  }
  
  /**
   * 处理连接丢失事件
   */
  private handleConnectionLost() {
    // 更新连接状态
    this.connectionState.connected = false;
    
    // 清除任何现有的重连计时器
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // 如果已经有上次的服务器URL，尝试重新连接
    const lastServerUrl = this.connectionState.serverName;
    if (lastServerUrl) {
      console.log('检测到连接丢失，将尝试重新连接...');
      
      this.reconnectTimeout = setTimeout(() => {
        if (!this.connectionState.connected) {
          this.connect(lastServerUrl).catch(err => {
            console.error('重新连接失败:', err);
          });
        }
      }, 5000); // 5秒后尝试重连
    }
  }
  
  /**
   * 初始化MCP客户端
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      const result = await RustMcpClient.initialize();
      this.isInitialized = Boolean(result);
      return Boolean(result);
    } catch (error) {
      console.error('初始化MCP客户端失败:', error);
      this.isInitialized = false;
      throw this.normalizeError(error, 'initialization_failed', '初始化MCP客户端失败');
    }
  }
  
  /**
   * 标准化错误对象
   */
  private normalizeError(error: any, defaultCode: string, defaultMessage: string): McpError {
    if (error instanceof McpError) {
      return error;
    }
    
    if (error?.error?.code && error?.error?.message) {
      return new McpError(error.error.code, error.error.message);
    }
    
    return new McpError(
      defaultCode,
      error?.message || defaultMessage
    );
  }
  
  /**
   * 连接到MCP服务器
   * @param serverUrl MCP服务器URL
   * @param retryOnFailure 是否在失败时重试
   */
  async connect(serverUrl: string, retryOnFailure: boolean = true): Promise<boolean> {
    // 确保初始化
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // 如果已经在连接中，返回现有的promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    
    const connectOperation = async () => {
      try {
        // 存储连接promise以防止并发连接请求
        this.connectionPromise = RustMcpClient.connect(serverUrl);
        const connected = await this.connectionPromise;
        
        if (connected) {
          // 更新服务器信息
          await this.updateServerInfo();
        }
        
        return Boolean(connected);
      } catch (error) {
        console.error('MCP连接失败:', error);
        throw this.normalizeError(error, 'connection_failed', `连接到 ${serverUrl} 失败`);
      } finally {
        this.connectionPromise = null;
      }
    };
    
    if (retryOnFailure) {
      return withRetry(connectOperation, this.retryConfig);
    } else {
      return connectOperation();
    }
  }
  
  /**
   * 更新服务器信息
   */
  private async updateServerInfo(): Promise<void> {
    try {
      const infoJson = await RustMcpClient.getServerInfo();
      if (infoJson && infoJson !== 'null') {
        this.serverInfo = JSON.parse(infoJson);
      }
    } catch (error) {
      console.warn('获取服务器信息失败:', error);
      // 不抛出异常，因为这不是关键操作
    }
  }
  
  /**
   * 断开与MCP服务器的连接
   */
  async disconnect(): Promise<boolean> {
    // 清除重连计时器
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    try {
      const result = await RustMcpClient.disconnect();
      return Boolean(result);
    } catch (error) {
      console.error('MCP断开连接失败:', error);
      throw this.normalizeError(error, 'disconnect_failed', '断开MCP连接失败');
    } finally {
      // 无论如何都更新状态
      this.connectionState.connected = false;
    }
  }
  
  /**
   * 调用MCP工具
   * @param name 工具名称
   * @param parameters 参数
   * @param retryOnFailure 是否在失败时重试
   */
  async callTool(name: string, parameters: Record<string, any> = {}, retryOnFailure: boolean = true): Promise<McpResponse> {
    const callOperation = async () => {
      try {
        // 检查连接状态
        if (!this.connectionState.connected) {
          throw new McpError('not_connected', 'MCP客户端未连接到服务器');
        }
        
        const response = await RustMcpClient.callTool(name, JSON.stringify(parameters));
        
        // 检查错误响应
        const parsed = JSON.parse(response);
        if (parsed.error) {
          throw new McpError(parsed.error.code, parsed.error.message);
        }
        
        return parsed as McpResponse;
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        console.error(`调用工具 ${name} 失败:`, error);
        throw this.normalizeError(error, 'tool_call_failed', `调用工具 ${name} 失败`);
      }
    };
    
    if (retryOnFailure) {
      return withRetry(callOperation, this.retryConfig);
    } else {
      return callOperation();
    }
  }
  
  /**
   * 请求MCP资源
   * @param uri 资源URI
   * @param retryOnFailure 是否在失败时重试
   */
  async requestResource(uri: string, retryOnFailure: boolean = true): Promise<McpResource> {
    const requestOperation = async () => {
      try {
        // 检查连接状态
        if (!this.connectionState.connected) {
          throw new McpError('not_connected', 'MCP客户端未连接到服务器');
        }
        
        const resource = await RustMcpClient.requestResource(uri);
        
        // 检查错误响应
        const parsed = JSON.parse(resource);
        if (parsed.error) {
          throw new McpError(parsed.error.code, parsed.error.message);
        }
        
        return parsed as McpResource;
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        console.error(`请求资源 ${uri} 失败:`, error);
        throw this.normalizeError(error, 'resource_request_failed', `请求资源 ${uri} 失败`);
      }
    };
    
    if (retryOnFailure) {
      return withRetry(requestOperation, this.retryConfig);
    } else {
      return requestOperation();
    }
  }
  
  /**
   * 获取服务器信息
   */
  async getServerInfo(): Promise<McpServerInfo | null> {
    if (this.serverInfo) {
      return this.serverInfo;
    }
    
    try {
      const info = await RustMcpClient.getServerInfo();
      if (info && info !== 'null') {
        this.serverInfo = JSON.parse(info);
        return this.serverInfo;
      }
      return null;
    } catch (error) {
      console.error('获取服务器信息失败:', error);
      return null;
    }
  }
  
  /**
   * 检查是否已连接
   */
  async isConnected(): Promise<boolean> {
    try {
      const connected = await RustMcpClient.isConnected();
      // 同步更新本地状态
      this.connectionState.connected = Boolean(connected);
      return Boolean(connected);
    } catch (error) {
      console.error('检查连接状态失败:', error);
      return false;
    }
  }
  
  /**
   * 处理MCP输入
   * @param message MCP消息
   */
  async handleInput(message: string): Promise<boolean> {
    try {
      const result = await RustMcpClient.handleInput(message);
      return Boolean(result);
    } catch (error) {
      console.error('处理MCP输入失败:', error);
      throw this.normalizeError(error, 'input_handling_failed', '处理MCP输入失败');
    }
  }
  
  /**
   * 设置重试配置
   */
  setRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = {
      ...this.retryConfig,
      ...config
    };
  }
  
  /**
   * 清理所有事件监听器
   */
  cleanup() {
    // 清除重连计时器
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // 清除事件订阅
    this.subscriptions.forEach(subscription => subscription.remove());
    this.subscriptions = [];
    
    // 清除事件监听器
    this.removeAllListeners();
  }
}

// 导出单例实例
export const mcpClientBridge = new McpClientBridge();

/**
 * MCP客户端Hook - 简化在React组件中使用MCP客户端
 * 在实际应用中可以扩展为一个完整的React Hook
 */
export function useMcpClient() {
  return mcpClientBridge;
} 