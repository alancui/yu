import { OperationResult, MockServerConfig, TranscriptionResult } from '../mockServer';

/**
 * API客户端接口
 * 定义了客户端与服务器交互的标准方法
 */
export interface IApiClient {
  // 文本处理
  processText(text: string): Promise<OperationResult>;
  
  // 语音处理
  startSpeechProcessing(audioConfig: { format: string, sampleRate: number }): Promise<{ transcriptionId: string, sseEndpoint: string }>;
  sendAudioChunk(transcriptionId: string, audioData: ArrayBuffer): Promise<{ received: boolean }>;
  endSpeechProcessing(transcriptionId: string): Promise<OperationResult & { transcription: string }>;
  
  // MCP工具调用
  callMcpTool(toolName: string, parameters: any): Promise<any>;
  
  // 创建转录客户端
  createTranscriptionClient(transcriptionId: string, sseEndpoint: string): ITranscriptionClient;
}

/**
 * 转录客户端接口
 * 定义了语音转录客户端的标准方法
 */
export interface ITranscriptionClient {
  connect(): boolean;
  disconnect(): void;
  on(event: string, listener: (...args: any[]) => void): this;
  off(event: string, listener: (...args: any[]) => void): this;
}

/**
 * API客户端配置接口
 */
export interface IApiClientConfig {
  // 延迟设置
  minDelay?: number;
  maxDelay?: number;
  // 错误模拟设置
  errorRate?: number;
  networkErrorRate?: number;
  serverOverloadRate?: number;
  timeoutRate?: number;
  // 其他配置
  enableLogs?: boolean;
  [key: string]: any; // 允许额外的配置项
}

/**
 * API客户端工厂接口
 * 用于创建API客户端实例
 */
export interface IApiClientFactory {
  createApiClient(): IApiClient;
  setClientConfig(config: Partial<IApiClientConfig>): void;
} 