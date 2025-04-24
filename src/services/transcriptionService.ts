import { EventEmitter } from 'events';
import { TranscriptionResult } from './mockServer';
import { serviceProvider } from './ServiceProvider';
import { IApiClient, ITranscriptionClient } from './interfaces/IApiClient';

/**
 * 音频配置接口
 */
export interface AudioConfig {
  format: string;
  sampleRate: number;
}

/**
 * 转录结果事件类型
 */
export enum TranscriptionEventType {
  Transcription = 'transcription',
  Complete = 'complete',
  Error = 'error',
}

/**
 * 完整的转录结果
 */
export interface CompleteTranscriptionResult {
  transcriptionId: string;
  text: string;
  confidence: number;
}

/**
 * 转录会话类
 * 表示一次语音转录的全生命周期
 */
export class TranscriptionSession extends EventEmitter {
  private transcriptionId: string;
  private sseClient: ITranscriptionClient | null = null;
  private sseEndpoint: string;
  private active: boolean = false;
  private apiClient: IApiClient;
  
  /**
   * 构造函数
   * @param transcriptionId 转录ID
   * @param sseEndpoint SSE端点
   */
  constructor(transcriptionId: string, sseEndpoint: string) {
    super();
    this.transcriptionId = transcriptionId;
    this.sseEndpoint = sseEndpoint;
    this.apiClient = serviceProvider.getApiClient();
  }
  
  /**
   * 启动SSE连接
   */
  start(): boolean {
    if (this.active) return true;
    
    try {
      // 使用API客户端创建SSE客户端
      this.sseClient = this.apiClient.createTranscriptionClient(this.transcriptionId, this.sseEndpoint);
      
      // 设置事件处理器
      this.sseClient
        .on('transcription', (result: TranscriptionResult) => {
          this.emit(TranscriptionEventType.Transcription, result);
        })
        .on('complete', (result: CompleteTranscriptionResult) => {
          this.emit(TranscriptionEventType.Complete, result);
          this.stop();
        })
        .on('error', (error: any) => {
          this.emit(TranscriptionEventType.Error, error);
          this.stop();
        });
      
      // 连接到SSE端点
      const connected = this.sseClient.connect();
      this.active = connected;
      return connected;
    } catch (error) {
      console.error('启动SSE连接失败:', error);
      this.emit(TranscriptionEventType.Error, error);
      return false;
    }
  }
  
  /**
   * 停止SSE连接
   */
  stop(): void {
    if (!this.active) return;
    
    try {
      if (this.sseClient) {
        this.sseClient.disconnect();
        this.sseClient = null;
      }
    } catch (error) {
      console.error('停止SSE连接失败:', error);
    } finally {
      this.active = false;
    }
  }
  
  /**
   * 获取转录ID
   */
  getTranscriptionId(): string {
    return this.transcriptionId;
  }
  
  /**
   * 检查是否活动
   */
  isActive(): boolean {
    return this.active;
  }
}

/**
 * 转录服务
 * 用于管理语音转录过程
 */
export class TranscriptionService {
  private activeSessions: Map<string, TranscriptionSession> = new Map();
  private apiClient: IApiClient;
  
  /**
   * 构造函数
   */
  constructor() {
    this.apiClient = serviceProvider.getApiClient();
  }
  
  /**
   * 开始语音处理
   * @param audioConfig 音频配置
   */
  async startSpeechProcessing(audioConfig: AudioConfig): Promise<TranscriptionSession> {
    try {
      // 调用API开始处理
      const { transcriptionId, sseEndpoint } = await this.apiClient.startSpeechProcessing(audioConfig);
      
      // 创建并启动会话
      const session = new TranscriptionSession(transcriptionId, sseEndpoint);
      this.activeSessions.set(transcriptionId, session);
      
      // 启动SSE连接
      session.start();
      
      return session;
    } catch (error) {
      console.error('开始语音处理失败:', error);
      throw error;
    }
  }
  
  /**
   * 发送音频数据
   * @param transcriptionId 转录ID
   * @param audioData 音频数据
   */
  async sendAudioChunk(transcriptionId: string, audioData: ArrayBuffer): Promise<boolean> {
    try {
      const session = this.activeSessions.get(transcriptionId);
      if (!session || !session.isActive()) {
        throw new Error(`转录会话 ${transcriptionId} 不存在或已不活动`);
      }
      
      const { received } = await this.apiClient.sendAudioChunk(transcriptionId, audioData);
      return received;
    } catch (error) {
      console.error(`发送音频数据失败 (ID=${transcriptionId}):`, error);
      throw error;
    }
  }
  
  /**
   * 结束语音处理
   * @param transcriptionId 转录ID
   */
  async endSpeechProcessing(transcriptionId: string): Promise<any> {
    try {
      const session = this.activeSessions.get(transcriptionId);
      if (!session) {
        throw new Error(`转录会话 ${transcriptionId} 不存在`);
      }
      
      // 调用API结束处理
      const result = await this.apiClient.endSpeechProcessing(transcriptionId);
      
      // 清理会话
      this.activeSessions.delete(transcriptionId);
      
      return result;
    } catch (error) {
      console.error(`结束语音处理失败 (ID=${transcriptionId}):`, error);
      
      // 确保会话被清理
      this.activeSessions.delete(transcriptionId);
      
      throw error;
    }
  }
  
  /**
   * 获取活动会话
   * @param transcriptionId 转录ID
   */
  getSession(transcriptionId: string): TranscriptionSession | undefined {
    return this.activeSessions.get(transcriptionId);
  }
  
  /**
   * 获取所有活动会话
   */
  getAllSessions(): TranscriptionSession[] {
    return Array.from(this.activeSessions.values());
  }
}

// 导出单例实例
export const transcriptionService = new TranscriptionService(); 