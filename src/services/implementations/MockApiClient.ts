import { EventEmitter } from 'events';
import { IApiClient, ITranscriptionClient, IApiClientFactory, IApiClientConfig } from '../interfaces/IApiClient';
import { mockServer, OperationResult, MockTranscriptionClient } from '../mockServer';

/**
 * Mock API客户端实现
 * 基于mockServer实现IApiClient接口
 */
export class MockApiClient implements IApiClient {
  /**
   * 处理文本
   */
  async processText(text: string): Promise<OperationResult> {
    return mockServer.processText(text);
  }
  
  /**
   * 开始语音处理
   */
  async startSpeechProcessing(audioConfig: { format: string, sampleRate: number }): Promise<{ transcriptionId: string, sseEndpoint: string }> {
    return mockServer.startSpeechProcessing(audioConfig);
  }
  
  /**
   * 发送音频数据
   */
  async sendAudioChunk(transcriptionId: string, audioData: ArrayBuffer): Promise<{ received: boolean }> {
    return mockServer.sendAudioChunk(transcriptionId, audioData);
  }
  
  /**
   * 结束语音处理
   */
  async endSpeechProcessing(transcriptionId: string): Promise<OperationResult & { transcription: string }> {
    return mockServer.endSpeechProcessing(transcriptionId);
  }
  
  /**
   * 调用MCP工具
   */
  async callMcpTool(toolName: string, parameters: any): Promise<any> {
    return mockServer.callMcpTool(toolName, parameters);
  }
  
  /**
   * 创建转录客户端
   */
  createTranscriptionClient(transcriptionId: string, sseEndpoint: string): ITranscriptionClient {
    return new MockTranscriptionClientWrapper(transcriptionId, sseEndpoint);
  }
}

/**
 * Mock转录客户端包装器
 * 继承原有的MockTranscriptionClient，实现ITranscriptionClient接口
 */
export class MockTranscriptionClientWrapper extends MockTranscriptionClient implements ITranscriptionClient {
  /**
   * 添加事件监听器
   * 重写为使用ITranscriptionClient类型
   */
  on(event: string, listener: (...args: any[]) => void): this {
    super.on(event, listener);
    return this;
  }
  
  /**
   * 移除事件监听器
   * 重写为使用ITranscriptionClient类型
   */
  off(event: string, listener: (...args: any[]) => void): this {
    this.removeListener(event, listener);
    return this;
  }
}

/**
 * Mock API客户端工厂
 * 实现IApiClientFactory接口，用于创建Mock API客户端实例
 */
export class MockApiClientFactory implements IApiClientFactory {
  /**
   * 创建API客户端实例
   */
  createApiClient(): IApiClient {
    return new MockApiClient();
  }
  
  /**
   * 设置客户端配置
   */
  setClientConfig(config: Partial<IApiClientConfig>): void {
    mockServer.setConfig(config);
  }
}

// 导出工厂单例，方便使用
export const mockApiClientFactory = new MockApiClientFactory(); 