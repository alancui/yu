#import "RustMcpClient.h"

// 声明Rust FFI函数
extern bool mcp_init_client(void);
extern bool mcp_connect(const char* server_url);
extern bool mcp_disconnect(void);
extern bool mcp_is_connected(void);
extern char* mcp_call_tool(const char* tool_name, const char* parameters_json);
extern char* mcp_request_resource(const char* uri);
extern char* mcp_get_server_info(void);
extern bool mcp_handle_input_from_rn(const char* message);
extern void mcp_free_string(char* ptr);
extern bool mcp_register_event_callback(const char* event_name, void (*callback)(const char*, void*), void* context);

// 事件名称常量
static NSString* const EVENT_CONNECTION_STATE = @"mcpConnectionState";
static NSString* const EVENT_TOOL_CALL = @"mcpToolCall";
static NSString* const EVENT_RESOURCE_REQUEST = @"mcpResourceRequest";
static NSString* const EVENT_ERROR = @"mcpError";

// 注册的事件名称列表
static NSArray<NSString*>* eventNames;

@implementation RustMcpClient {
    bool hasListeners;
}

RCT_EXPORT_MODULE()

+ (void)initialize {
    if (self == [RustMcpClient class]) {
        eventNames = @[
            EVENT_CONNECTION_STATE,
            EVENT_TOOL_CALL,
            EVENT_RESOURCE_REQUEST,
            EVENT_ERROR
        ];
    }
}

#pragma mark - RCTEventEmitter重写方法

- (NSArray<NSString *> *)supportedEvents {
    return eventNames;
}

- (void)startObserving {
    hasListeners = YES;
    
    // 当首次有JS需要监听事件时，可以注册所有需要的回调
    for (NSString *eventName in eventNames) {
        [self registerCallbackForEvent:eventName];
    }
}

- (void)stopObserving {
    hasListeners = NO;
    // 当没有监听者时，可以清理资源
}

#pragma mark - 辅助方法

// 注册事件回调
- (void)registerCallbackForEvent:(NSString *)eventName {
    if (!hasListeners) return;
    
    // 创建自定义上下文，包含事件名称和self引用
    RustMcpClient * __weak weakSelf = self;
    
    // 回调函数，用于从Rust接收事件
    void (*callback)(const char*, void*) = ^(const char* jsonData, void* context) {
        RustMcpClient *strongSelf = (__bridge RustMcpClient*)context;
        if (strongSelf && strongSelf->hasListeners) {
            NSString *eventNameStr = (__bridge NSString*)((void**)context)[1];
            NSString *jsonString = [NSString stringWithUTF8String:jsonData];
            [strongSelf sendEventWithName:eventNameStr body:jsonString];
        }
    };
    
    // 创建自定义上下文
    void* context = (__bridge void*)self;
    
    // 注册回调
    mcp_register_event_callback([eventName UTF8String], callback, context);
}

// 释放Rust字符串
- (NSString *)getStringAndFree:(char *)cString {
    if (cString == NULL) {
        return nil;
    }
    
    NSString *result = [NSString stringWithUTF8String:cString];
    mcp_free_string(cString);
    return result;
}

#pragma mark - 导出的方法

// 初始化MCP客户端
RCT_EXPORT_METHOD(initialize:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        bool result = mcp_init_client();
        resolve(@(result));
    } @catch (NSException *exception) {
        reject(@"INIT_ERROR", [NSString stringWithFormat:@"初始化MCP客户端异常: %@", exception.reason], nil);
    }
}

// 连接到MCP服务器
RCT_EXPORT_METHOD(connect:(NSString *)serverUrl
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        bool result = mcp_connect([serverUrl UTF8String]);
        resolve(@(result));
    } @catch (NSException *exception) {
        reject(@"CONNECT_ERROR", [NSString stringWithFormat:@"连接MCP服务器异常: %@", exception.reason], nil);
    }
}

// 断开MCP服务器连接
RCT_EXPORT_METHOD(disconnect:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        bool result = mcp_disconnect();
        resolve(@(result));
    } @catch (NSException *exception) {
        reject(@"DISCONNECT_ERROR", [NSString stringWithFormat:@"断开MCP服务器连接异常: %@", exception.reason], nil);
    }
}

// 检查是否已连接
RCT_EXPORT_METHOD(isConnected:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        bool result = mcp_is_connected();
        resolve(@(result));
    } @catch (NSException *exception) {
        reject(@"CONNECTION_CHECK_ERROR", [NSString stringWithFormat:@"检查MCP连接状态异常: %@", exception.reason], nil);
    }
}

// 调用MCP工具
RCT_EXPORT_METHOD(callTool:(NSString *)toolName
                  parametersJson:(NSString *)parametersJson
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        char* result = mcp_call_tool([toolName UTF8String], [parametersJson UTF8String]);
        NSString *jsonResult = [self getStringAndFree:result];
        resolve(jsonResult);
    } @catch (NSException *exception) {
        reject(@"TOOL_CALL_ERROR", [NSString stringWithFormat:@"调用MCP工具异常: %@", exception.reason], nil);
    }
}

// 请求MCP资源
RCT_EXPORT_METHOD(requestResource:(NSString *)uri
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        char* result = mcp_request_resource([uri UTF8String]);
        NSString *jsonResult = [self getStringAndFree:result];
        resolve(jsonResult);
    } @catch (NSException *exception) {
        reject(@"RESOURCE_REQUEST_ERROR", [NSString stringWithFormat:@"请求MCP资源异常: %@", exception.reason], nil);
    }
}

// 获取服务器信息
RCT_EXPORT_METHOD(getServerInfo:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        char* result = mcp_get_server_info();
        NSString *jsonResult = [self getStringAndFree:result];
        resolve(jsonResult);
    } @catch (NSException *exception) {
        reject(@"SERVER_INFO_ERROR", [NSString stringWithFormat:@"获取MCP服务器信息异常: %@", exception.reason], nil);
    }
}

// 处理来自RN的输入
RCT_EXPORT_METHOD(handleInput:(NSString *)message
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        bool result = mcp_handle_input_from_rn([message UTF8String]);
        resolve(@(result));
    } @catch (NSException *exception) {
        reject(@"INPUT_HANDLING_ERROR", [NSString stringWithFormat:@"处理MCP输入异常: %@", exception.reason], nil);
    }
}

@end 