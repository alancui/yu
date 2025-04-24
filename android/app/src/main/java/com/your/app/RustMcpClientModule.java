package com.your.app;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

public class RustMcpClientModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "RustMcpClient";
    
    // 事件名称常量
    private static final String EVENT_CONNECTION_STATE = "mcpConnectionState";
    private static final String EVENT_TOOL_CALL = "mcpToolCall";
    private static final String EVENT_RESOURCE_REQUEST = "mcpResourceRequest";
    private static final String EVENT_ERROR = "mcpError";
    
    // 已注册的事件回调
    private final Map<String, EventCallback> eventCallbacks = new HashMap<>();
    
    // 事件回调接口
    private interface EventCallback {
        void invoke(String jsonData);
    }
    
    static {
        // 加载Rust库
        System.loadLibrary("rust_mcp_client");
    }
    
    public RustMcpClientModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }
    
    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }
    
    // 初始化MCP客户端
    @ReactMethod
    public void initialize(Promise promise) {
        try {
            long result = initClient();
            if (result != 0) {
                promise.resolve(true);
            } else {
                promise.reject("INIT_ERROR", "初始化MCP客户端失败");
            }
        } catch (Exception e) {
            promise.reject("INIT_ERROR", "初始化MCP客户端异常: " + e.getMessage());
        }
    }
    
    // 连接到MCP服务器
    @ReactMethod
    public void connect(String serverUrl, Promise promise) {
        try {
            boolean result = connect(serverUrl);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("CONNECT_ERROR", "连接MCP服务器异常: " + e.getMessage());
        }
    }
    
    // 断开MCP服务器连接
    @ReactMethod
    public void disconnect(Promise promise) {
        try {
            boolean result = disconnect();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("DISCONNECT_ERROR", "断开MCP服务器连接异常: " + e.getMessage());
        }
    }
    
    // 检查是否已连接
    @ReactMethod
    public void isConnected(Promise promise) {
        try {
            boolean result = isConnected();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("CONNECTION_CHECK_ERROR", "检查MCP连接状态异常: " + e.getMessage());
        }
    }
    
    // 调用MCP工具
    @ReactMethod
    public void callTool(String toolName, String parametersJson, Promise promise) {
        try {
            String result = callTool(toolName, parametersJson);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("TOOL_CALL_ERROR", "调用MCP工具异常: " + e.getMessage());
        }
    }
    
    // 请求MCP资源
    @ReactMethod
    public void requestResource(String uri, Promise promise) {
        try {
            String result = requestResource(uri);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("RESOURCE_REQUEST_ERROR", "请求MCP资源异常: " + e.getMessage());
        }
    }
    
    // 获取服务器信息
    @ReactMethod
    public void getServerInfo(Promise promise) {
        try {
            String result = getServerInfo();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("SERVER_INFO_ERROR", "获取MCP服务器信息异常: " + e.getMessage());
        }
    }
    
    // 处理来自RN的输入
    @ReactMethod
    public void handleInput(String message, Promise promise) {
        try {
            boolean result = handleInputFromRN(message);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("INPUT_HANDLING_ERROR", "处理MCP输入异常: " + e.getMessage());
        }
    }
    
    // 注册事件监听器
    @ReactMethod
    public void addListener(String eventName) {
        // 为指定事件创建回调对象
        if (!eventCallbacks.containsKey(eventName)) {
            EventCallback callback = jsonData -> {
                sendEvent(getReactApplicationContext(), eventName, jsonData);
            };
            
            eventCallbacks.put(eventName, callback);
            
            // 注册到Rust端
            registerEventCallback(eventName, callback);
        }
    }
    
    // 移除事件监听器
    @ReactMethod
    public void removeListeners(Integer count) {
        // React Native要求实现这个方法，但我们不需要在这里做任何事情
        // 因为事件回调在Rust端被管理
    }
    
    // 发送事件到RN
    private void sendEvent(ReactContext reactContext, String eventName, String jsonData) {
        if (reactContext.hasActiveCatalystInstance()) {
            try {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, jsonData);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
    
    // JNI 方法声明
    private native long initClient();
    private native boolean connect(String serverUrl);
    private native boolean disconnect();
    private native boolean isConnected();
    private native String callTool(String toolName, String parametersJson);
    private native String requestResource(String uri);
    private native String getServerInfo();
    private native boolean handleInputFromRN(String message);
    private native boolean registerEventCallback(String eventName, EventCallback callback);
} 