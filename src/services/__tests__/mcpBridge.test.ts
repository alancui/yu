import { NativeModules, NativeEventEmitter } from 'react-native';
import { McpClientBridge, McpEventType, McpError, mcpClientBridge, RetryConfig } from '../mcpBridge';

// 直接引入原始的McpError类，避免循环依赖问题
// 注意：在实际测试中，这里不应该使用原始类，但为了简化测试，我们这样做
const OriginalMcpError = McpError;

// 模拟React Native模块
jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');
  
  return {
    ...reactNative,
    NativeModules: {
      ...reactNative.NativeModules,
      RustMcpClient: {
        initialize: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        isConnected: jest.fn(),
        callTool: jest.fn(),
        requestResource: jest.fn(),
        getServerInfo: jest.fn(),
        handleInput: jest.fn(),
      }
    },
    NativeEventEmitter: jest.fn().mockImplementation(() => ({
      addListener: jest.fn().mockImplementation(() => ({
        remove: jest.fn()
      }))
    }))
  };
});

// 模拟或部分模拟McpClientBridge以避免循环依赖
jest.mock('../mcpBridge', () => {
  const originalModule = jest.requireActual('../mcpBridge');
  
  return {
    ...originalModule,
    mcpClientBridge: {
      on: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      isConnected: jest.fn(),
      callTool: jest.fn(),
      requestResource: jest.fn(),
      getServerInfo: jest.fn(),
      handleInput: jest.fn(),
      removeAllListeners: jest.fn(),
      setRetryConfig: jest.fn(),
      cleanup: jest.fn(),
    },
    // 保持原始的枚举和错误类
    McpEventType: originalModule.McpEventType,
    McpError: originalModule.McpError,
  };
});

describe('McpClientBridge', () => {
  let bridge: McpClientBridge;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 创建一个新的实例以避免单例问题
    bridge = new McpClientBridge();
  });
  
  describe('初始化', () => {
    test('initialize方法应该调用原生模块', async () => {
      // 准备
      (NativeModules.RustMcpClient.initialize as jest.Mock).mockResolvedValue(true);
      
      // 执行
      const result = await bridge.initialize();
      
      // 验证
      expect(NativeModules.RustMcpClient.initialize).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    test('initialize方法应该处理错误', async () => {
      // 准备
      const error = new Error('初始化失败');
      (NativeModules.RustMcpClient.initialize as jest.Mock).mockRejectedValue(error);
      
      // 执行和验证
      await expect(bridge.initialize()).rejects.toThrow('初始化MCP客户端失败');
      expect(NativeModules.RustMcpClient.initialize).toHaveBeenCalled();
    });
  });
  
  describe('连接管理', () => {
    test('connect方法应该连接到服务器', async () => {
      // 准备
      const serverUrl = 'https://mcp-server.example.com';
      (NativeModules.RustMcpClient.initialize as jest.Mock).mockResolvedValue(true);
      (NativeModules.RustMcpClient.connect as jest.Mock).mockResolvedValue(true);
      (NativeModules.RustMcpClient.getServerInfo as jest.Mock).mockResolvedValue(JSON.stringify({
        name: 'Test Server',
        version: '1.0.0',
        tools: []
      }));
      
      // 执行
      const result = await bridge.connect(serverUrl);
      
      // 验证
      expect(NativeModules.RustMcpClient.connect).toHaveBeenCalledWith(serverUrl);
      expect(result).toBe(true);
    });
    
    test('connect方法应该处理连接失败', async () => {
      // 准备
      const serverUrl = 'https://mcp-server.example.com';
      (NativeModules.RustMcpClient.initialize as jest.Mock).mockResolvedValue(true);
      (NativeModules.RustMcpClient.connect as jest.Mock).mockRejectedValue(new Error('连接失败'));
      
      // 执行和验证
      await expect(bridge.connect(serverUrl, false)).rejects.toThrow('连接到 https://mcp-server.example.com 失败');
      expect(NativeModules.RustMcpClient.connect).toHaveBeenCalledWith(serverUrl);
    });
    
    test('disconnect方法应该断开连接', async () => {
      // 准备
      (NativeModules.RustMcpClient.disconnect as jest.Mock).mockResolvedValue(true);
      
      // 执行
      const result = await bridge.disconnect();
      
      // 验证
      expect(NativeModules.RustMcpClient.disconnect).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    test('isConnected方法应该检查连接状态', async () => {
      // 准备
      (NativeModules.RustMcpClient.isConnected as jest.Mock).mockResolvedValue(true);
      
      // 执行
      const result = await bridge.isConnected();
      
      // 验证
      expect(NativeModules.RustMcpClient.isConnected).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
  
  describe('工具调用和资源请求', () => {
    test('callTool方法应该调用原生模块', async () => {
      // 准备
      const toolName = 'testTool';
      const params = { key: 'value' };
      const mockResponse = JSON.stringify({
        content: [{ type: 'text', text: '测试响应' }]
      });
      
      // 模拟连接状态
      bridge['connectionState'] = { connected: true };
      (NativeModules.RustMcpClient.callTool as jest.Mock).mockResolvedValue(mockResponse);
      
      // 执行
      const result = await bridge.callTool(toolName, params);
      
      // 验证
      expect(NativeModules.RustMcpClient.callTool).toHaveBeenCalledWith(toolName, JSON.stringify(params));
      expect(result).toEqual({
        content: [{ type: 'text', text: '测试响应' }]
      });
    });
    
    test('callTool方法应该处理未连接状态', async () => {
      // 准备
      const toolName = 'testTool';
      const params = { key: 'value' };
      
      // 模拟未连接状态
      bridge['connectionState'] = { connected: false };
      
      // 执行和验证
      await expect(bridge.callTool(toolName, params, false)).rejects.toThrow('MCP客户端未连接到服务器');
      expect(NativeModules.RustMcpClient.callTool).not.toHaveBeenCalled();
    });
    
    test('callTool方法应该处理错误响应', async () => {
      // 准备
      const toolName = 'testTool';
      const params = { key: 'value' };
      const mockResponse = JSON.stringify({
        error: { code: 'test_error', message: '测试错误' }
      });
      
      // 模拟连接状态
      bridge['connectionState'] = { connected: true };
      (NativeModules.RustMcpClient.callTool as jest.Mock).mockResolvedValue(mockResponse);
      
      // 执行和验证
      await expect(bridge.callTool(toolName, params, false)).rejects.toThrow('测试错误');
      expect(NativeModules.RustMcpClient.callTool).toHaveBeenCalledWith(toolName, JSON.stringify(params));
    });
    
    test('requestResource方法应该调用原生模块', async () => {
      // 准备
      const uri = 'test://resource';
      const mockResponse = JSON.stringify({
        contents: [{ uri: 'test://resource', text: '测试资源', mimeType: 'text/plain' }]
      });
      
      // 模拟连接状态
      bridge['connectionState'] = { connected: true };
      (NativeModules.RustMcpClient.requestResource as jest.Mock).mockResolvedValue(mockResponse);
      
      // 执行
      const result = await bridge.requestResource(uri);
      
      // 验证
      expect(NativeModules.RustMcpClient.requestResource).toHaveBeenCalledWith(uri);
      expect(result).toEqual({
        contents: [{ uri: 'test://resource', text: '测试资源', mimeType: 'text/plain' }]
      });
    });
  });
  
  describe('服务器信息', () => {
    test('getServerInfo方法应该获取服务器信息', async () => {
      // 准备
      const mockInfo = {
        name: 'MCP Test Server',
        version: '1.0.0',
        tools: [
          { name: 'testTool', description: '测试工具', parametersSchema: {} }
        ]
      };
      
      (NativeModules.RustMcpClient.getServerInfo as jest.Mock).mockResolvedValue(JSON.stringify(mockInfo));
      
      // 执行
      const result = await bridge.getServerInfo();
      
      // 验证
      expect(NativeModules.RustMcpClient.getServerInfo).toHaveBeenCalled();
      expect(result).toEqual(mockInfo);
    });
    
    test('getServerInfo方法应该处理错误', async () => {
      // 准备
      (NativeModules.RustMcpClient.getServerInfo as jest.Mock).mockRejectedValue(new Error('获取服务器信息失败'));
      
      // 执行
      const result = await bridge.getServerInfo();
      
      // 验证
      expect(NativeModules.RustMcpClient.getServerInfo).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('事件处理', () => {
    test('setupEventListeners方法应该设置事件监听器', () => {
      // 准备和执行已在beforeEach中完成
      
      // 验证
      const mockEventEmitter = (NativeEventEmitter as jest.Mock).mock.results[0].value;
      expect(mockEventEmitter.addListener).toHaveBeenCalledWith('mcpConnectionState', expect.any(Function));
      expect(mockEventEmitter.addListener).toHaveBeenCalledWith('mcpToolCall', expect.any(Function));
      expect(mockEventEmitter.addListener).toHaveBeenCalledWith('mcpResourceRequest', expect.any(Function));
      expect(mockEventEmitter.addListener).toHaveBeenCalledWith('mcpError', expect.any(Function));
    });
  });
  
  describe('重试和错误处理', () => {
    test('setRetryConfig方法应该更新重试配置', () => {
      // 准备
      const newConfig: Partial<RetryConfig> = {
        maxRetries: 5,
        initialDelayMs: 1000
      };
      
      // 执行
      bridge.setRetryConfig(newConfig);
      
      // 验证 - 由于retryConfig是私有属性，我们可以通过后续测试间接验证
      expect((bridge as any).retryConfig.maxRetries).toBe(5);
      expect((bridge as any).retryConfig.initialDelayMs).toBe(1000);
    });
  });
  
  describe('资源清理', () => {
    test('cleanup方法应该清理资源', () => {
      // 准备 - 设置模拟的超时和订阅
      const mockTimeout = setTimeout(() => {}, 1000);
      (bridge as any).reconnectTimeout = mockTimeout;
      
      // 执行
      bridge.cleanup();
      
      // 验证
      const mockEventEmitter = (NativeEventEmitter as jest.Mock).mock.results[0].value;
      // 检查订阅的remove方法是否被调用
      expect(mockEventEmitter.addListener.mock.results[0].value.remove).toHaveBeenCalled();
    });
  });
});

describe('McpError', () => {
  test('应该正确创建错误对象', () => {
    // 执行
    const error = new OriginalMcpError('test_error', '测试错误消息');
    
    // 验证
    expect(error.code).toBe('test_error');
    expect(error.message).toBe('测试错误消息');
    expect(error.name).toBe('McpError');
    expect(error instanceof Error).toBe(true);
  });
});

describe('mcpClientBridge单例', () => {
  test('应该导出一个McpClientBridge实例', () => {
    expect(mcpClientBridge).toBeInstanceOf(McpClientBridge);
  });
}); 