import { OperationResult } from './mockServer';
import { serviceProvider } from './ServiceProvider';
import { IApiClient } from './interfaces/IApiClient';

/**
 * 文本处理结果
 */
export interface TextProcessingResult {
  text: string;
  result: OperationResult;
}

/**
 * 文本处理服务
 * 用于将用户输入的文本发送到服务器处理
 */
export class TextProcessingService {
  private processing: boolean = false;
  private queue: { text: string, resolve: (result: TextProcessingResult) => void, reject: (error: any) => void }[] = [];
  private apiClient: IApiClient;
  
  /**
   * 构造函数
   */
  constructor() {
    this.apiClient = serviceProvider.getApiClient();
  }
  
  /**
   * 处理文本
   * @param text 要处理的文本
   */
  async processText(text: string): Promise<TextProcessingResult> {
    if (!text || text.trim() === '') {
      throw new Error('文本不能为空');
    }
    
    // 如果当前已有处理中的请求，将此请求加入队列
    if (this.processing) {
      return new Promise((resolve, reject) => {
        this.queue.push({ text, resolve, reject });
      });
    }
    
    try {
      this.processing = true;
      
      // 调用API处理文本
      const result = await this.apiClient.processText(text);
      
      // 创建处理结果
      const processResult: TextProcessingResult = {
        text,
        result
      };
      
      return processResult;
    } catch (error) {
      console.error('处理文本失败:', error);
      throw error;
    } finally {
      this.processing = false;
      
      // 处理队列中的下一个请求
      this.processNextInQueue();
    }
  }
  
  /**
   * 处理队列中的下一个请求
   */
  private async processNextInQueue(): Promise<void> {
    if (this.queue.length === 0) return;
    
    const { text, resolve, reject } = this.queue.shift()!;
    
    try {
      const result = await this.processText(text);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  }
  
  /**
   * 检查是否正在处理
   */
  isProcessing(): boolean {
    return this.processing;
  }
  
  /**
   * 获取队列长度
   */
  getQueueLength(): number {
    return this.queue.length;
  }
  
  /**
   * 清空队列
   */
  clearQueue(): void {
    const error = new Error('请求已取消');
    this.queue.forEach(item => item.reject(error));
    this.queue = [];
  }
}

// 导出单例实例
export const textProcessingService = new TextProcessingService(); 