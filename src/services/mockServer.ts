import { EventEmitter } from 'events';

// 模拟API响应延迟 (ms)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 操作结果类型定义
export interface OperationResult {
  success: boolean;
  targetSystem: string;
  operation: string;
  details?: any;
  error?: string;
}

// 转录结果类型
export interface TranscriptionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

// 模拟服务器配置
export interface MockServerConfig {
  // 延迟设置
  minDelay?: number;  // 最小延迟(ms)
  maxDelay?: number;  // 最大延迟(ms)
  // 错误模拟设置
  errorRate?: number; // 错误概率 (0-1)
  networkErrorRate?: number; // 网络错误概率 (0-1)
  serverOverloadRate?: number; // 服务器过载概率 (0-1)
  timeoutRate?: number; // 请求超时概率 (0-1)
  // 转录设置
  transcriptionVariability?: number; // 转录文本变异度 (0-1)
  transcriptionErrorRate?: number; // 转录错误率 (0-1)
  // 日志设置
  enableLogs?: boolean; // 是否启用日志
  // 性能模拟
  jitterFactor?: number; // 网络抖动因子 (0-1)
  packetLossRate?: number; // 数据包丢失率 (0-1)
}

// 模拟错误类型
export enum MockErrorType {
  NETWORK = 'network_error',
  TIMEOUT = 'timeout_error',
  SERVER = 'server_error',
  AUTH = 'authentication_error',
  VALIDATION = 'validation_error',
  RESOURCE = 'resource_not_found',
  RATE_LIMIT = 'rate_limit_exceeded',
}

// 模拟错误信息
const ErrorMessages = {
  [MockErrorType.NETWORK]: '网络连接中断，请检查网络连接并重试',
  [MockErrorType.TIMEOUT]: '请求超时，服务器响应时间过长',
  [MockErrorType.SERVER]: '服务器内部错误，请稍后重试',
  [MockErrorType.AUTH]: '身份验证失败，请重新登录',
  [MockErrorType.VALIDATION]: '请求参数验证失败',
  [MockErrorType.RESOURCE]: '请求的资源不存在',
  [MockErrorType.RATE_LIMIT]: '超出请求限制，请稍后再试',
};

// 模拟SSE事件发射器
class MockSSEEmitter extends EventEmitter {
  private isActive = false;
  private mockWords = [
    "正在", "处理", "您的", "语音", "输入", "请稍等", 
    "这是", "实时", "转录", "的", "模拟", "结果",
    "嗯", "啊", "那个", "就是", "然后", "可能", "其实",
    "我觉得", "好像", "应该", "或许", "大概"
  ];
  private transcriptionId: string;
  
  constructor(transcriptionId: string) {
    super();
    this.transcriptionId = transcriptionId;
  }

  // 模拟网络波动延迟
  private async simulateNetworkDelay(config: MockServerConfig) {
    const baseDelay = config.minDelay || 200;
    const maxDelay = config.maxDelay || 800;
    const jitter = config.jitterFactor || 0;
    
    // 基础延迟
    let waitTime = baseDelay + Math.random() * (maxDelay - baseDelay);
    
    // 加入网络抖动
    if (jitter > 0) {
      waitTime += (Math.random() * 2 - 1) * jitter * baseDelay;
    }
    
    await delay(Math.max(10, waitTime));
  }
  
  // 随机生成语音识别错误单词
  private generateMisrecognizedWord(word: string): string {
    // 简单模拟: 有50%概率用音近字替换
    const similarWords: Record<string, string[]> = {
      "会议": ["回忆", "惠及", "汇集"],
      "提醒": ["体形", "梯形", "踢星"],
      "记录": ["基础", "寄录", "计禄"],
      "安排": ["按牌", "暗派", "案牌"],
      "时间": ["实践", "事件", "识见"],
      "明天": ["名田", "明添", "铭添"],
      "下午": ["夏木", "下木", "虾姆"],
      "上午": ["商务", "上物", "尚武"],
      "晚上": ["玩赏", "晚霜", "万象"],
      "买": ["卖", "埋", "迈"],
      "牛奶": ["纽带", "牛代", "扭带"]
    };
    
    if (similarWords[word] && Math.random() < 0.5) {
      const options = similarWords[word];
      return options[Math.floor(Math.random() * options.length)];
    }
    return word;
  }

  // 开始模拟转录流
  async startTranscriptionStream(fullText: string, config: MockServerConfig = {}) {
    this.isActive = true;
    
    // 模拟实时转录：随机选择词语发送
    let transcript = "";
    const words = fullText.split(' ');
    
    // 可能随机添加一些干扰词
    const shouldAddNoise = () => Math.random() < (config.transcriptionVariability || 0.1);
    const getRandomNoiseWord = () => this.mockWords[Math.floor(Math.random() * this.mockWords.length)];
    const shouldMisrecognize = () => Math.random() < (config.transcriptionErrorRate || 0.05);
    
    for (let i = 0; i < words.length; i++) {
      if (!this.isActive) break;
      
      // 模拟数据包丢失
      if (Math.random() < (config.packetLossRate || 0)) {
        // 跳过这个单词模拟数据包丢失
        continue;
      }
      
      // 随机模拟网络错误
      if (Math.random() < (config.networkErrorRate || 0)) {
        this.emit('error', { 
          code: MockErrorType.NETWORK, 
          message: ErrorMessages[MockErrorType.NETWORK]
        });
        break;
      }
      
      // 模拟超时错误
      if (Math.random() < (config.timeoutRate || 0)) {
        this.emit('error', {
          code: MockErrorType.TIMEOUT,
          message: ErrorMessages[MockErrorType.TIMEOUT]
        });
        break;
      }
      
      // 处理当前单词 - 可能会错误识别
      let currentWord = words[i];
      if (shouldMisrecognize()) {
        currentWord = this.generateMisrecognizedWord(currentWord);
      }
      
      // 添加单词到当前转录
      transcript += (i > 0 ? ' ' : '') + currentWord;
      
      // 可能添加一些噪声词
      if (shouldAddNoise()) {
        transcript += ' ' + getRandomNoiseWord();
      }
      
      // 发送部分转录
      const partialResult: TranscriptionResult = {
        text: transcript,
        confidence: 0.5 + Math.random() * 0.5, // 更真实的置信度
        isFinal: i === words.length - 1
      };
      
      this.emit('transcription', partialResult);
      
      // 模拟处理时间，提供更随机的延迟
      await this.simulateNetworkDelay(config);
    }
    
    // 模拟最终转录完成可能的错误
    if (Math.random() < (config.errorRate || 0)) {
      this.emit('error', { 
        code: 'transcription_failed', 
        message: '转录处理失败，请重试' 
      });
    } else {
      // 发送完成事件
      this.emit('complete', {
        transcriptionId: this.transcriptionId,
        text: fullText,
        confidence: 0.8 + Math.random() * 0.2 // 最终结果通常有较高置信度
      });
    }
    
    this.isActive = false;
  }
  
  // 停止转录流
  stop() {
    this.isActive = false;
    this.emit('stop', { transcriptionId: this.transcriptionId });
  }
}

// 模拟服务器类
export class MockServer {
  private transcriptions: Map<string, MockSSEEmitter> = new Map();
  private config: MockServerConfig = {
    minDelay: 200,
    maxDelay: 2000,
    errorRate: 0.05,
    networkErrorRate: 0.02,
    serverOverloadRate: 0.01,
    timeoutRate: 0.02,
    transcriptionVariability: 0.1,
    transcriptionErrorRate: 0.05,
    enableLogs: true,
    jitterFactor: 0.2,
    packetLossRate: 0.01
  };
  
  // 设置配置
  setConfig(config: Partial<MockServerConfig>) {
    this.config = { ...this.config, ...config };
    if (this.config.enableLogs) {
      console.log(`[MockServer] 配置已更新:`, this.config);
    }
  }
  
  // 内部日志方法
  private log(message: string) {
    if (this.config.enableLogs) {
      console.log(`[MockServer] ${message}`);
    }
  }
  
  // 模拟随机错误
  private simulateRandomError(): { shouldError: boolean, errorType: MockErrorType } {
    // 网络错误
    if (Math.random() < this.config.networkErrorRate!) {
      return { shouldError: true, errorType: MockErrorType.NETWORK };
    }
    
    // 超时错误
    if (Math.random() < this.config.timeoutRate!) {
      return { shouldError: true, errorType: MockErrorType.TIMEOUT };
    }
    
    // 服务器错误
    if (Math.random() < this.config.serverOverloadRate!) {
      return { shouldError: true, errorType: MockErrorType.SERVER };
    }
    
    // 正常情况
    return { shouldError: false, errorType: MockErrorType.NETWORK };
  }
  
  // 模拟处理延迟
  private async simulateProcessingDelay() {
    const { shouldError, errorType } = this.simulateRandomError();
    
    // 如果是超时错误，模拟较长延迟
    if (shouldError && errorType === MockErrorType.TIMEOUT) {
      const timeoutDelay = this.config.maxDelay! * 2;
      await delay(timeoutDelay);
      throw new Error(ErrorMessages[errorType]);
    }
    
    // 如果是其他类型错误
    if (shouldError) {
      await delay(this.config.minDelay! + Math.random() * 200);
      throw new Error(ErrorMessages[errorType]);
    }
    
    // 正常延迟
    const requestDelay = this.config.minDelay! + Math.random() * (this.config.maxDelay! - this.config.minDelay!);
    await delay(requestDelay);
  }
  
  // 模拟文字处理API
  async processText(text: string): Promise<OperationResult> {
    this.log(`处理文字: ${text}`);
    
    try {
      // 模拟请求延迟和可能的错误
      await this.simulateProcessingDelay();
    } catch (error: any) {
      this.log(`处理文字失败: ${text} - ${error.message}`);
      return {
        success: false,
        targetSystem: 'None',
        operation: 'processText',
        error: error.message
      };
    }
    
    // 模拟一般错误情况
    if (Math.random() < this.config.errorRate!) {
      this.log(`处理文字失败: ${text}`);
      return {
        success: false,
        targetSystem: 'None',
        operation: 'processText',
        error: '处理文本时发生错误，请重试'
      };
    }
    
    // 根据文本内容模拟不同的操作结果
    if (text.includes('日程') || text.includes('会议') || text.includes('安排')) {
      return {
        success: true,
        targetSystem: 'Calendar',
        operation: 'createEvent',
        details: {
          title: `关于${text.slice(0, 10)}的会议`,
          startTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          duration: 60 // 分钟
        }
      };
    } 
    else if (text.includes('提醒') || text.includes('待办') || text.includes('记得')) {
      return {
        success: true,
        targetSystem: 'Reminders',
        operation: 'createReminder',
        details: {
          title: text.replace(/提醒我|记得/g, '').trim(),
          dueDate: new Date(Date.now() + 12 * 3600 * 1000).toISOString()
        }
      };
    }
    else if (text.includes('笔记') || text.includes('记录')) {
      return {
        success: true,
        targetSystem: 'Notes',
        operation: 'createNote',
        details: {
          title: `笔记: ${text.slice(0, 15)}...`,
          content: text,
          createdAt: new Date().toISOString()
        }
      };
    }
    else {
      // 默认返回一个通用回复
      return {
        success: true,
        targetSystem: 'Assistant',
        operation: 'respondToQuery',
        details: {
          response: `我已经处理了您的请求: "${text}"。有什么其他我可以帮您的吗？`
        }
      };
    }
  }
  
  // 模拟语音处理API - 启动转录
  startSpeechProcessing(audioConfig: { format: string, sampleRate: number }): { transcriptionId: string, sseEndpoint: string } {
    const transcriptionId = `trans_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const sseEndpoint = `/api/transcription/${transcriptionId}/stream`;
    
    // 创建新的SSE发射器
    const emitter = new MockSSEEmitter(transcriptionId);
    this.transcriptions.set(transcriptionId, emitter);
    
    this.log(`开始语音处理: ID=${transcriptionId}, 配置=${JSON.stringify(audioConfig)}`);
    
    return { transcriptionId, sseEndpoint };
  }
  
  // 发送音频数据
  async sendAudioChunk(transcriptionId: string, audioData: ArrayBuffer): Promise<{ received: boolean }> {
    this.log(`接收音频数据: ID=${transcriptionId}, 大小=${audioData.byteLength}字节`);
    
    try {
      // 模拟网络延迟和可能的错误
      await this.simulateProcessingDelay();
    } catch (error: any) {
      throw new Error(`音频数据传输失败: ${error.message}`);
    }
    
    return { received: true };
  }
  
  // 生成更丰富多样的模拟转录文本
  private generateMockTranscription(): string {
    // 根据不同类型的请求生成更真实的转录文本
    const mockPhrases = [
      // 日历事件相关
      "明天下午三点安排一个团队会议",
      "后天早上九点到十一点预约客户会议",
      "下周一上午十点安排医生预约",
      "这周五下午两点半到四点安排产品评审",
      "下周三晚上七点安排家庭聚餐",
      
      // 提醒相关
      "提醒我晚上八点给妈妈打电话",
      "提醒我明天早上带签字文件去办公室",
      "记得买牛奶、鸡蛋和面包",
      "提醒我周五交季度报告",
      "提醒我下午三点参加线上会议",
      
      // 笔记相关
      "记录一下这次会议的重点内容：首先要优化用户界面，其次需要修复已知bug，最后规划下一版本功能",
      "记录一下新产品创意：开发一款集成AI助手的智能日程管理应用",
      "记笔记：项目截止日期是6月15日，需要完成所有功能测试和文档编写",
      "做个笔记：联系张经理讨论市场推广计划和预算分配",
      "记录一下购物清单：新键盘、显示器支架、网络摄像头",
      
      // 复杂句式
      "明天下午三点到五点在会议室A安排产品规划讨论，记得通知设计和开发团队",
      "下周一早上九点半提醒我准备季度报告演示文稿，需要包含销售数据和用户增长分析",
      "记录一下今天的会议内容并提醒我明天跟进讨论的三个关键问题",
      "安排下周三下午两点到四点的项目评审会议，并记录需要准备的材料：进度报告、风险分析和资源需求",
      "提醒我今晚八点看新剧集，记得提前半小时订外卖"
    ];
    
    // 随机选择一个短语
    return mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
  }
  
  // 结束语音处理并获取完整结果
  async endSpeechProcessing(transcriptionId: string): Promise<OperationResult & { transcription: string }> {
    this.log(`结束语音处理: ID=${transcriptionId}`);
    
    try {
      // 模拟处理延迟和可能的错误
      await this.simulateProcessingDelay();
    } catch (error: any) {
      this.log(`语音处理失败: ID=${transcriptionId} - ${error.message}`);
      
      // 清理
      this.transcriptions.delete(transcriptionId);
      
      return {
        success: false,
        targetSystem: 'None',
        operation: 'speechProcessing',
        transcription: '',
        error: `语音处理失败: ${error.message}`
      };
    }
    
    // 模拟一般错误情况
    if (Math.random() < this.config.errorRate!) {
      this.log(`语音处理失败: ID=${transcriptionId}`);
      
      // 清理
      this.transcriptions.delete(transcriptionId);
      
      return {
        success: false,
        targetSystem: 'None',
        operation: 'speechProcessing',
        transcription: '',
        error: '语音处理失败，请重试'
      };
    }
    
    // 生成更丰富多样的模拟转录文本
    const transcription = this.generateMockTranscription();
    
    // 如果存在对应的SSE发射器，启动模拟转录流
    const emitter = this.transcriptions.get(transcriptionId);
    if (emitter) {
      emitter.startTranscriptionStream(transcription, this.config);
      
      // 模拟处理延迟
      const processingDelay = 1000 + Math.random() * 3000;
      await delay(processingDelay);
      
      // 清理
      this.transcriptions.delete(transcriptionId);
    }
    
    // 返回结果（复用文字处理逻辑）
    const operationResult = await this.processText(transcription);
    
    return {
      ...operationResult,
      transcription
    };
  }
  
  // 创建SSE响应处理函数 - 在实际应用中可用于ExpressJS或类似的服务器框架
  createSSEHandler(transcriptionId: string) {
    const emitter = this.transcriptions.get(transcriptionId);
    if (!emitter) {
      throw new Error(`未找到ID为${transcriptionId}的转录`);
    }
    
    // 这个函数在实际服务器环境中实现
    // 这里仅返回监听函数供模拟使用
    return {
      onTranscription: (callback: (result: TranscriptionResult) => void) => {
        emitter.on('transcription', callback);
      },
      onComplete: (callback: (result: any) => void) => {
        emitter.on('complete', callback);
      },
      onError: (callback: (error: any) => void) => {
        emitter.on('error', callback);
      },
      onStop: (callback: (result: any) => void) => {
        emitter.on('stop', callback);
      }
    };
  }
  
  // 模拟MCP工具调用
  async callMcpTool(toolName: string, parameters: any): Promise<any> {
    this.log(`MCP工具调用: ${toolName}, 参数: ${JSON.stringify(parameters)}`);
    
    try {
      // 模拟处理延迟和可能的错误
      await this.simulateProcessingDelay();
    } catch (error: any) {
      this.log(`MCP工具调用失败: ${toolName} - ${error.message}`);
      throw new Error(`工具调用失败: ${toolName} - ${error.message}`);
    }
    
    // 模拟一般错误情况
    if (Math.random() < this.config.errorRate!) {
      this.log(`MCP工具调用失败: ${toolName}`);
      throw new Error(`工具调用失败: ${toolName}`);
    }
    
    // 根据工具名称返回不同的结果
    switch (toolName) {
      case 'createCalendarEvent':
        return {
          success: true,
          eventId: `evt_${Date.now()}`,
          title: parameters.title || '新事件',
          startTime: parameters.startTime || new Date().toISOString(),
          endTime: parameters.endTime || new Date(Date.now() + 3600000).toISOString(),
        };
        
      case 'createReminder':
        return {
          success: true,
          reminderId: `rem_${Date.now()}`,
          title: parameters.title || '新提醒',
          dueDate: parameters.dueDate || new Date().toISOString(),
          priority: parameters.priority || 'normal',
        };
        
      case 'createNote':
        return {
          success: true,
          noteId: `note_${Date.now()}`,
          title: parameters.title || '新笔记',
          content: parameters.content || '',
          created: new Date().toISOString(),
        };
        
      case 'processUserInput':
        // 如果是处理用户输入，调用文本处理
        if (parameters.text) {
          return this.processText(parameters.text);
        }
        return {
          success: true,
          content: [{ type: 'text', text: '我已经处理了您的请求' }]
        };
        
      default:
        // 未知工具，返回一个通用响应
        return {
          success: true,
          message: `工具 ${toolName} 已执行`,
        };
    }
  }
}

// 创建并导出单例
export const mockServer = new MockServer();

// 客户端API示例
export class MockApiClient {
  // 处理文字请求
  static async processText(text: string): Promise<OperationResult> {
    return mockServer.processText(text);
  }
  
  // 开始语音处理
  static async startSpeechProcessing(audioConfig: { format: string, sampleRate: number }) {
    return mockServer.startSpeechProcessing(audioConfig);
  }
  
  // 发送音频数据
  static async sendAudioChunk(transcriptionId: string, audioData: ArrayBuffer) {
    return mockServer.sendAudioChunk(transcriptionId, audioData);
  }
  
  // 结束语音处理并获取结果
  static async endSpeechProcessing(transcriptionId: string) {
    return mockServer.endSpeechProcessing(transcriptionId);
  }
  
  // 创建SSE客户端
  static createTranscriptionClient(transcriptionId: string, sseEndpoint: string) {
    return new MockTranscriptionClient(transcriptionId, sseEndpoint);
  }
  
  // MCP工具调用
  static async callMcpTool(toolName: string, parameters: any) {
    return mockServer.callMcpTool(toolName, parameters);
  }
  
  // 设置模拟服务器配置
  static setServerConfig(config: Partial<MockServerConfig>) {
    mockServer.setConfig(config);
  }
}

// 模拟使用SSE的客户端API
export class MockTranscriptionClient extends EventEmitter {
  private transcriptionId: string;
  private eventSource: EventSource | null = null;
  private eventHandlers: {
    onTranscription?: (result: TranscriptionResult) => void;
    onComplete?: (result: any) => void;
    onError?: (error: any) => void;
  } = {};
  private isConnected: boolean = false;
  
  constructor(transcriptionId: string, sseEndpoint: string) {
    super();
    this.transcriptionId = transcriptionId;
    
    // 在实际应用中，这会连接到真实的SSE端点
    // 在这个模拟中，我们直接使用MockServer的SSE处理程序
    
    console.log(`[MockClient] 连接到SSE端点: ${sseEndpoint}`);
    
    // 在实际应用中，这里会是: this.eventSource = new EventSource(sseEndpoint);
    // 但在模拟中我们直接使用模拟服务器的发射器
  }
  
  // 连接到模拟服务器的SSE处理程序
  connect() {
    try {
      const handler = mockServer.createSSEHandler(this.transcriptionId);
      
      // 设置事件监听器
      handler.onTranscription((result) => {
        if (this.isConnected) {
          this.emit('transcription', result);
        }
      });
      
      handler.onComplete((result) => {
        if (this.isConnected) {
          this.emit('complete', result);
          this.disconnect();
        }
      });
      
      handler.onError((error) => {
        if (this.isConnected) {
          this.emit('error', error);
          this.disconnect();
        }
      });
      
      handler.onStop(() => {
        this.disconnect();
      });
      
      this.isConnected = true;
      return true;
    } catch (error) {
      this.emit('error', error);
      return false;
    }
  }
  
  // 断开SSE连接
  disconnect() {
    this.isConnected = false;
    this.removeAllListeners();
    console.log(`[MockClient] 断开SSE连接: ID=${this.transcriptionId}`);
  }
  
  // EventEmitter接口 - 为了与标准EventEmitter保持兼容
  on(event: string, listener: (...args: any[]) => void): this {
    super.on(event, listener);
    
    // 保存事件处理器引用，以便在connect()时使用
    if (event === 'transcription') {
      this.eventHandlers.onTranscription = listener as any;
    } else if (event === 'complete') {
      this.eventHandlers.onComplete = listener as any;
    } else if (event === 'error') {
      this.eventHandlers.onError = listener as any;
    }
    
    return this;
  }
} 

