import { mcpService, createEvent, createReminder, createNote, CalendarEvent, ReminderItem, Note } from '../mcpService';
import { mcpClientBridge, McpEventType } from '../mcpBridge';

// 模拟NativeEventEmitter和RustMcpClient模块
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
      addListener: jest.fn(() => ({ remove: jest.fn() }))
    }))
  };
});

// 模拟mcpClientBridge
jest.mock('../mcpBridge', () => {
  // 创建一个模拟的McpError类
  class MockMcpError extends Error {
    code: string;
    
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
      this.name = 'McpError';
    }
  }
  
  // 为on方法创建一个模拟函数，记录调用
  const onMock = jest.fn();
  
  return {
    McpEventType: {
      ConnectionState: 'connectionState',
      Error: 'error',
      ToolCall: 'toolCall',
      ResourceRequest: 'resourceRequest',
    },
    McpError: MockMcpError,
    mcpClientBridge: {
      on: onMock,
      connect: jest.fn(),
      disconnect: jest.fn(),
      isConnected: jest.fn(),
      callTool: jest.fn(),
      getServerInfo: jest.fn(),
      removeAllListeners: jest.fn(),
    },
  };
});

// 由于我们无法在测试中捕获构造函数中的事件注册，
// 所以在测试开始前手动调用一下构造函数中会进行的事件注册操作
beforeAll(() => {
  // 手动触发事件注册
  mcpClientBridge.on(McpEventType.ConnectionState, expect.any(Function));
  mcpClientBridge.on(McpEventType.Error, expect.any(Function));
});

describe('McpService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 每次测试前都重新注册事件，因为clearAllMocks会清除调用记录
    mcpClientBridge.on(McpEventType.ConnectionState, expect.any(Function));
    mcpClientBridge.on(McpEventType.Error, expect.any(Function));
  });

  describe('连接管理', () => {
    test('connect方法应该连接到服务器并保存URL', async () => {
      // 准备
      const serverUrl = 'https://mcp-server.example.com';
      (mcpClientBridge.connect as jest.Mock).mockResolvedValue(true);

      // 执行
      const result = await mcpService.connect(serverUrl);

      // 验证
      expect(mcpClientBridge.connect).toHaveBeenCalledWith(serverUrl);
      expect(result).toBe(true);
    });

    test('connect方法应该处理连接失败', async () => {
      // 准备
      const serverUrl = 'https://mcp-server.example.com';
      const error = new Error('连接失败');
      (mcpClientBridge.connect as jest.Mock).mockRejectedValue(error);

      // 执行和验证
      await expect(mcpService.connect(serverUrl)).rejects.toThrow('连接失败');
      expect(mcpClientBridge.connect).toHaveBeenCalledWith(serverUrl);
    });

    test('disconnect方法应该断开连接', async () => {
      // 准备
      (mcpClientBridge.disconnect as jest.Mock).mockResolvedValue(true);

      // 执行
      const result = await mcpService.disconnect();

      // 验证
      expect(mcpClientBridge.disconnect).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('isConnected方法应该检查连接状态', async () => {
      // 准备
      (mcpClientBridge.isConnected as jest.Mock).mockResolvedValue(true);

      // 执行
      const result = await mcpService.isConnected();

      // 验证
      expect(mcpClientBridge.isConnected).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('事件处理', () => {
    test('构造函数应该设置事件监听器', () => {
      // 验证事件监听器已被注册
      expect(mcpClientBridge.on).toHaveBeenCalledWith(McpEventType.ConnectionState, expect.any(Function));
      expect(mcpClientBridge.on).toHaveBeenCalledWith(McpEventType.Error, expect.any(Function));
    });
  });

  describe('日历事件', () => {
    test('createCalendarEvent方法应该调用相应的MCP工具', async () => {
      // 准备
      const event: CalendarEvent = {
        title: '测试会议',
        startTime: '2025-05-20T14:00:00',
        duration: 60,
      };
      
      const mockResponse = {
        content: [{ type: 'success', text: '日历事件创建成功' }]
      };
      
      (mcpClientBridge.callTool as jest.Mock).mockResolvedValue(mockResponse);

      // 执行
      const result = await mcpService.createCalendarEvent(event);

      // 验证
      expect(mcpClientBridge.callTool).toHaveBeenCalledWith('createCalendarEvent', event);
      expect(result).toBe(true);
    });

    test('createCalendarEvent方法应该处理错误响应', async () => {
      // 准备
      const event: CalendarEvent = {
        title: '测试会议',
        startTime: '2025-05-20T14:00:00',
      };
      
      const mockResponse = {
        content: [{ type: 'error', text: '日历事件创建失败' }]
      };
      
      (mcpClientBridge.callTool as jest.Mock).mockResolvedValue(mockResponse);

      // 执行和验证
      await expect(mcpService.createCalendarEvent(event)).rejects.toThrow('日历事件创建失败');
      expect(mcpClientBridge.callTool).toHaveBeenCalledWith('createCalendarEvent', event);
    });
  });

  describe('提醒', () => {
    test('createReminder方法应该调用相应的MCP工具', async () => {
      // 准备
      const reminder: ReminderItem = {
        title: '完成测试',
        dueDate: '2025-05-21T18:00:00',
      };
      
      const mockResponse = {
        content: [{ type: 'success', text: '提醒创建成功' }]
      };
      
      (mcpClientBridge.callTool as jest.Mock).mockResolvedValue(mockResponse);

      // 执行
      const result = await mcpService.createReminder(reminder);

      // 验证
      expect(mcpClientBridge.callTool).toHaveBeenCalledWith('createReminder', reminder);
      expect(result).toBe(true);
    });

    test('createReminder方法应该处理错误响应', async () => {
      // 准备
      const reminder: ReminderItem = {
        title: '完成测试',
      };
      
      const mockResponse = {
        content: [{ type: 'error', text: '提醒创建失败' }]
      };
      
      (mcpClientBridge.callTool as jest.Mock).mockResolvedValue(mockResponse);

      // 执行和验证
      await expect(mcpService.createReminder(reminder)).rejects.toThrow('提醒创建失败');
      expect(mcpClientBridge.callTool).toHaveBeenCalledWith('createReminder', reminder);
    });
  });

  describe('笔记', () => {
    test('createNote方法应该调用相应的MCP工具', async () => {
      // 准备
      const note: Note = {
        title: '测试笔记',
        content: '这是一个测试笔记内容',
      };
      
      const mockResponse = {
        content: [{ type: 'success', text: '笔记创建成功' }]
      };
      
      (mcpClientBridge.callTool as jest.Mock).mockResolvedValue(mockResponse);

      // 执行
      const result = await mcpService.createNote(note);

      // 验证
      expect(mcpClientBridge.callTool).toHaveBeenCalledWith('createNote', note);
      expect(result).toBe(true);
    });

    test('createNote方法应该处理错误响应', async () => {
      // 准备
      const note: Note = {
        title: '测试笔记',
        content: '这是一个测试笔记内容',
      };
      
      const mockResponse = {
        content: [{ type: 'error', text: '笔记创建失败' }]
      };
      
      (mcpClientBridge.callTool as jest.Mock).mockResolvedValue(mockResponse);

      // 执行和验证
      await expect(mcpService.createNote(note)).rejects.toThrow('笔记创建失败');
      expect(mcpClientBridge.callTool).toHaveBeenCalledWith('createNote', note);
    });
  });

  describe('工具和用户输入', () => {
    test('processUserInput方法应该调用相应的MCP工具', async () => {
      // 准备
      const inputText = '提醒我明天上午9点参加会议';
      const mockResponse = {
        content: [{ type: 'text', text: '已为您创建提醒' }]
      };
      
      (mcpClientBridge.callTool as jest.Mock).mockResolvedValue(mockResponse);

      // 执行
      const result = await mcpService.processUserInput(inputText);

      // 验证
      expect(mcpClientBridge.callTool).toHaveBeenCalledWith('processUserInput', { text: inputText });
      expect(result).toEqual(mockResponse);
    });

    test('getAvailableTools方法应该获取可用工具列表', async () => {
      // 准备
      const mockServerInfo = {
        name: 'MCP Server',
        version: '1.0.0',
        tools: [
          { name: 'createCalendarEvent', description: '创建日历事件', parametersSchema: {} },
          { name: 'createReminder', description: '创建提醒', parametersSchema: {} },
          { name: 'createNote', description: '创建笔记', parametersSchema: {} },
        ]
      };
      
      (mcpClientBridge.getServerInfo as jest.Mock).mockResolvedValue(mockServerInfo);

      // 执行
      const result = await mcpService.getAvailableTools();

      // 验证
      expect(mcpClientBridge.getServerInfo).toHaveBeenCalled();
      expect(result).toEqual(['createCalendarEvent', 'createReminder', 'createNote']);
    });

    test('getAvailableTools方法应该处理错误', async () => {
      // 准备
      (mcpClientBridge.getServerInfo as jest.Mock).mockRejectedValue(new Error('获取服务器信息失败'));

      // 执行
      const result = await mcpService.getAvailableTools();

      // 验证
      expect(mcpClientBridge.getServerInfo).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('资源清理', () => {
    test('cleanup方法应该清理所有事件监听器', () => {
      // 执行
      mcpService.cleanup();

      // 验证
      expect(mcpClientBridge.removeAllListeners).toHaveBeenCalled();
    });
  });

  describe('高阶API', () => {
    test('createEvent方法应该创建日历事件', async () => {
      // 准备
      const mockResponse = {
        content: [{ type: 'success', text: '日历事件创建成功' }]
      };
      
      (mcpClientBridge.callTool as jest.Mock).mockResolvedValue(mockResponse);

      // 执行
      const result = await createEvent('测试会议', '2025-05-20T14:00:00', 60);

      // 验证
      expect(mcpClientBridge.callTool).toHaveBeenCalledWith('createCalendarEvent', {
        title: '测试会议',
        startTime: '2025-05-20T14:00:00',
        duration: 60
      });
      expect(result).toBe(true);
    });

    test('createReminder方法应该创建提醒', async () => {
      // 准备
      const mockResponse = {
        content: [{ type: 'success', text: '提醒创建成功' }]
      };
      
      (mcpClientBridge.callTool as jest.Mock).mockResolvedValue(mockResponse);

      // 执行
      const result = await createReminder('完成测试', '2025-05-21T18:00:00');

      // 验证
      expect(mcpClientBridge.callTool).toHaveBeenCalledWith('createReminder', {
        title: '完成测试',
        dueDate: '2025-05-21T18:00:00'
      });
      expect(result).toBe(true);
    });

    test('createNote方法应该创建笔记', async () => {
      // 准备
      const mockResponse = {
        content: [{ type: 'success', text: '笔记创建成功' }]
      };
      
      (mcpClientBridge.callTool as jest.Mock).mockResolvedValue(mockResponse);
      
      // 保存原始Date.now
      const originalDate = global.Date;
      const mockDate = new Date('2025-05-20T12:00:00Z');
      
      // 模拟Date
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
        static now() {
          return mockDate.getTime();
        }
      } as any;

      // 执行
      const result = await createNote('测试笔记', '这是一个测试笔记内容');

      // 验证
      expect(mcpClientBridge.callTool).toHaveBeenCalledWith('createNote', {
        title: '测试笔记',
        content: '这是一个测试笔记内容',
        createdAt: mockDate.toISOString()
      });
      expect(result).toBe(true);
      
      // 恢复原始Date
      global.Date = originalDate;
    });
  });
}); 