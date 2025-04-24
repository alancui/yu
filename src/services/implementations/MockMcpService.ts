import { EventEmitter } from 'events';
import { IMcpService, ITranscriptionClient, IMcpServiceFactory, IMcpServiceConfig } from '../interfaces/IMcpService';
import { mockServer, OperationResult, MockTranscriptionClient } from '../mockServer';
import { IApiClient } from '../interfaces/IApiClient';
import { mockApiClientFactory } from './MockApiClient';

/**
 * Mock MCP服务实现
 * 基于mockServer实现IMcpService接口
 */
export class MockMcpService extends EventEmitter implements IMcpService {
  private isConnectedState: boolean = false;
  private serverUrl: string | null = null;
  private apiClient: IApiClient;

  constructor() {
    super();
    this.apiClient = mockApiClientFactory.createApiClient();
  }

  /**
   * 连接到MCP服务器
   */
  async connect(serverUrl: string): Promise<boolean> {
    // 模拟连接过程
    await new Promise(resolve => setTimeout(resolve, 100));
    this.isConnectedState = true;
    this.serverUrl = serverUrl;
    this.emit('connectionState', { connected: true, serverName: 'Mock MCP Server' });
    return true;
  }

  /**
   * 断开与MCP服务器的连接
   */
  async disconnect(): Promise<boolean> {
    this.isConnectedState = false;
    this.serverUrl = null;
    this.emit('connectionState', { connected: false });
    return true;
  }

  /**
   * 检查连接状态
   */
  async isConnected(): Promise<boolean> {
    return this.isConnectedState;
  }

  /**
   * 调用MCP工具
   */
  async callTool(name: string, parameters: Record<string, any> = {}): Promise<any> {
    if (!this.isConnectedState) {
      throw new Error('未连接到MCP服务器');
    }
    
    return this.apiClient.callMcpTool(name, parameters);
  }

  /**
   * 获取服务器信息
   */
  async getServerInfo(): Promise<any> {
    if (!this.isConnectedState) {
      throw new Error('未连接到MCP服务器');
    }
    
    return {
      name: 'Mock MCP Server',
      version: '1.0.0',
      tools: [
        { name: 'createCalendarEvent', description: '创建日历事件' },
        { name: 'createReminder', description: '创建提醒' },
        { name: 'createNote', description: '创建笔记' },
        { name: 'processUserInput', description: '处理用户输入' }
      ]
    };
  }

  /**
   * 处理文本
   */
  async processText(text: string): Promise<OperationResult> {
    return this.apiClient.processText(text);
  }

  /**
   * 开始语音处理
   */
  async startSpeechProcessing(audioConfig: { format: string, sampleRate: number }): Promise<{ transcriptionId: string, sseEndpoint: string }> {
    return this.apiClient.startSpeechProcessing(audioConfig);
  }

  /**
   * 发送音频数据块
   */
  async sendAudioChunk(transcriptionId: string, audioData: ArrayBuffer): Promise<{ received: boolean }> {
    return this.apiClient.sendAudioChunk(transcriptionId, audioData);
  }

  /**
   * 结束语音处理
   */
  async endSpeechProcessing(transcriptionId: string): Promise<OperationResult & { transcription: string }> {
    return this.apiClient.endSpeechProcessing(transcriptionId);
  }

  /**
   * 移除事件监听器
   * @override 重写EventEmitter的off方法以满足接口要求
   */
  off(event: string, listener: (...args: any[]) => void): this {
    this.removeListener(event, listener);
    return this;
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.removeAllListeners();
  }
}

/**
 * Mock转录客户端
 * 继承原有的MockTranscriptionClient，实现ITranscriptionClient接口
 */
export class MockTranscriptionClientWrapper extends MockTranscriptionClient implements ITranscriptionClient {
  /**
   * 移除事件监听器
   */
  off(event: string, listener: (...args: any[]) => void): this {
    this.removeListener(event, listener);
    return this;
  }
}

/**
 * Mock MCP服务工厂
 * 实现IMcpServiceFactory接口，用于创建Mock MCP服务实例
 */
export class MockMcpServiceFactory implements IMcpServiceFactory {
  /**
   * 创建MCP服务实例
   */
  createMcpService(): IMcpService {
    return new MockMcpService();
  }

  /**
   * 创建转录客户端实例
   */
  createTranscriptionClient(transcriptionId: string, endpoint: string): ITranscriptionClient {
    return new MockTranscriptionClientWrapper(transcriptionId, endpoint);
  }

  /**
   * 设置服务配置
   */
  setServiceConfig(config: Partial<IMcpServiceConfig>): void {
    mockApiClientFactory.setClientConfig(config);
  }
}

// 导出工厂单例，方便使用
export const mockMcpServiceFactory = new MockMcpServiceFactory(); 