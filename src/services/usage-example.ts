/**
 * 这是一个示例文件，演示如何在应用中使用服务提供者
 * 实际使用时，可以在组件或屏幕中引入serviceProvider
 * 注意：此文件仅作示范，不应该被导入到实际代码中
 */

import { serviceProvider } from './ServiceProvider';
import { IMcpService } from './interfaces/IMcpService';
import { IApiClient } from './interfaces/IApiClient';

/**
 * 使用服务的示例函数
 */
export async function exampleUsage() {
  // 通过serviceProvider获取服务实例
  const mcpService: IMcpService = serviceProvider.getMcpService();
  const apiClient: IApiClient = serviceProvider.getApiClient();
  
  try {
    // 连接到MCP服务器
    await mcpService.connect('mock://server');
    
    // 处理文本
    const textResult = await mcpService.processText('你好，世界！');
    console.log('文本处理结果:', textResult);
    
    // 调用MCP工具
    const toolResult = await mcpService.callTool('createNote', {
      title: '测试笔记',
      content: '这是一条通过接口创建的测试笔记'
    });
    console.log('工具调用结果:', toolResult);
    
    // 使用API客户端
    const audioConfig = { format: 'wav', sampleRate: 16000 };
    const { transcriptionId, sseEndpoint } = await apiClient.startSpeechProcessing(audioConfig);
    console.log('开始语音处理:', transcriptionId);
    
    // 创建转录客户端
    const transcriptionClient = apiClient.createTranscriptionClient(transcriptionId, sseEndpoint);
    
    // 设置事件监听
    transcriptionClient.on('transcription', (result) => {
      console.log('实时转录:', result);
    });
    
    // 连接转录服务
    transcriptionClient.connect();
    
    // 模拟发送音频数据
    const dummyAudio = new ArrayBuffer(1024);
    await apiClient.sendAudioChunk(transcriptionId, dummyAudio);
    
    // 结束语音处理
    const finalResult = await apiClient.endSpeechProcessing(transcriptionId);
    console.log('最终转录结果:', finalResult);
    
    // 断开连接
    transcriptionClient.disconnect();
    await mcpService.disconnect();
  } catch (error) {
    console.error('示例执行失败:', error);
  } finally {
    // 清理资源
    serviceProvider.cleanup();
  }
}

/**
 * 切换服务实现的示例
 */
export function switchServiceImplementation() {
  // 假设我们有一个真实的MCP服务工厂
  // const realMcpServiceFactory = new RealMcpServiceFactory();
  
  // 通过服务提供者切换实现
  // serviceProvider.setMcpServiceFactory(realMcpServiceFactory);
  
  console.log('已切换到真实MCP服务实现');
}

/**
 * 服务配置示例
 */
export function configureServices() {
  // 配置MCP服务
  serviceProvider.configureMcpService({
    minDelay: 100,
    maxDelay: 1000,
    errorRate: 0.01
  });
  
  // 配置API客户端
  serviceProvider.configureApiClient({
    enableLogs: true,
    timeoutRate: 0.02
  });
  
  console.log('服务配置已更新');
} 