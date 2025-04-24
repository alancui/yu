import { OperationResult, TranscriptionResult } from '../mockServer';

/**
 * MCP服务接口
 * 定义了MCP服务需要实现的所有方法，便于在mock和真实实现之间切换
 */
export interface IMcpService {
  // 连接管理
  connect(serverUrl: string): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): Promise<boolean>;
  
  // 工具调用
  callTool(name: string, parameters: Record<string, any>): Promise<any>;
  getServerInfo(): Promise<any>;
  
  // 文本处理
  processText(text: string): Promise<OperationResult>;
  
  // 语音处理
  startSpeechProcessing(audioConfig: { format: string, sampleRate: number }): Promise<{ transcriptionId: string, sseEndpoint: string }>;
  sendAudioChunk(transcriptionId: string, audioData: ArrayBuffer): Promise<{ received: boolean }>;
  endSpeechProcessing(transcriptionId: string): Promise<OperationResult & { transcription: string }>;
  
  // 事件管理
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
  
  // 资源管理
  cleanup(): void;
}

/**
 * 转录客户端接口
 */
export interface ITranscriptionClient {
  connect(): boolean;
  disconnect(): void;
  on(event: string, listener: (...args: any[]) => void): this;
  off(event: string, listener: (...args: any[]) => void): this;
}

/**
 * MCP服务配置接口
 */
export interface IMcpServiceConfig {
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
 * 服务工厂接口
 * 用于创建服务实例和管理服务依赖
 */
export interface IMcpServiceFactory {
  createMcpService(): IMcpService;
  createTranscriptionClient(transcriptionId: string, endpoint: string): ITranscriptionClient;
  setServiceConfig(config: Partial<IMcpServiceConfig>): void;
} 