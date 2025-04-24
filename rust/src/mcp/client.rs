use crate::mcp::protocol::{
    McpMessage, McpResponse, McpResource, McpServerInfo, McpTool, parse_mcp_message, serialize_mcp_message,
    text_content
};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fmt;

// ===== 错误处理 =====

#[derive(Debug)]
pub enum McpError {
    ConnectionError(String),
    CommunicationError(String),
    ProtocolError(String),
    ServerError { code: String, message: String },
    Timeout,
    Disconnected,
    InternalError(String),
}

impl fmt::Display for McpError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            McpError::ConnectionError(msg) => write!(f, "连接错误: {}", msg),
            McpError::CommunicationError(msg) => write!(f, "通信错误: {}", msg),
            McpError::ProtocolError(msg) => write!(f, "协议错误: {}", msg),
            McpError::ServerError { code, message } => write!(f, "服务器错误 [{}]: {}", code, message),
            McpError::Timeout => write!(f, "操作超时"),
            McpError::Disconnected => write!(f, "连接已断开"),
            McpError::InternalError(msg) => write!(f, "内部错误: {}", msg),
        }
    }
}

impl Error for McpError {}

type Result<T> = std::result::Result<T, McpError>;

// ===== React Native 交互 =====

/// 用于与React Native交互的回调类型
#[derive(Clone)]
pub struct RNCallback {
    callback_id: String, 
    // 实际环境中会使用React Native FFI绑定，这里简化为函数指针
    #[allow(dead_code)]
    handler: Arc<dyn Fn(String) + Send + Sync>,
}

/// 用于与React Native交互的事件类型
#[derive(Serialize, Deserialize)]
pub enum McpEvent {
    /// 收到工具调用
    ToolCall {
        call_id: String,
        name: String,
        parameters: HashMap<String, serde_json::Value>,
    },
    /// 收到资源请求
    ResourceRequest {
        request_id: String,
        uri: String,
    },
    /// 连接状态变更
    ConnectionState {
        connected: bool,
        server_name: Option<String>,
    },
    /// 发生错误
    Error {
        code: String,
        message: String,
    },
}

// ===== MCP客户端 =====

/// MCP客户端实现
pub struct McpClient {
    /// 连接状态
    connected: bool,
    /// 服务器信息
    server_info: Option<McpServerInfo>,
    /// 待处理的响应
    pending_responses: Arc<Mutex<HashMap<String, oneshot::Sender<Result<McpMessage>>>>>,
    /// 用于接收转发的MCP消息的通道
    receiver: Option<Arc<Mutex<mpsc::Receiver<String>>>>,
    /// 用于发送消息到服务器的通道
    sender: Option<mpsc::Sender<String>>,
    /// 与React Native的交互回调
    rn_callback: Option<RNCallback>,
}

impl McpClient {
    /// 创建新的MCP客户端
    pub fn new() -> Self {
        McpClient {
            connected: false,
            server_info: None,
            pending_responses: Arc::new(Mutex::new(HashMap::new())),
            receiver: None,
            sender: None,
            rn_callback: None,
        }
    }
    
    /// 设置React Native回调
    pub fn set_rn_callback(&mut self, callback: RNCallback) {
        self.rn_callback = Some(callback);
    }
    
    /// 处理来自React Native的输入消息
    pub fn handle_input_from_rn(&mut self, message: &str) -> Result<()> {
        let mcp_message = parse_mcp_message(message)
            .map_err(|e| McpError::ProtocolError(format!("解析消息失败: {}", e)))?;
        
        self.handle_incoming_message(mcp_message)
    }
    
    /// 处理传入的MCP消息
    fn handle_incoming_message(&mut self, message: McpMessage) -> Result<()> {
        match &message {
            McpMessage::ToolResponse { call_id, .. } | 
            McpMessage::ResourceResponse { request_id: call_id, .. } => {
                // 查找并完成待处理的响应
                let mut pending = self.pending_responses.lock().unwrap();
                if let Some(sender) = pending.remove(call_id) {
                    let _ = sender.send(Ok(message.clone()));
                }
            },
            McpMessage::Error { reference_id: Some(id), code, message: error_msg } => {
                // 处理针对特定请求的错误
                let mut pending = self.pending_responses.lock().unwrap();
                if let Some(sender) = pending.remove(id) {
                    let _ = sender.send(Err(McpError::ServerError { 
                        code: code.clone(), 
                        message: error_msg.clone() 
                    }));
                }
            },
            McpMessage::Handshake { server_info, .. } => {
                // 处理握手响应
                self.connected = true;
                self.server_info = server_info.clone();
                
                // 通知React Native连接状态变更
                self.send_event_to_rn(McpEvent::ConnectionState { 
                    connected: true, 
                    server_name: self.server_info.as_ref().map(|i| i.name.clone()),
                });
            },
            McpMessage::Error { reference_id: None, code, message: error_msg } => {
                // 处理一般错误
                self.send_event_to_rn(McpEvent::Error { 
                    code: code.clone(), 
                    message: error_msg.clone() 
                });
            },
            _ => {
                // 其他消息类型，可能需要添加更多处理逻辑
            }
        }
        
        Ok(())
    }
    
    /// 向React Native发送事件
    fn send_event_to_rn(&self, event: McpEvent) {
        if let Some(callback) = &self.rn_callback {
            if let Ok(json) = serde_json::to_string(&event) {
                // 在实际实现中，这里会调用callback.handler
                println!("向RN发送事件: {} - {}", callback.callback_id, json);
            }
        }
    }
    
    /// 连接到MCP服务器
    pub async fn connect(&mut self, server_url: &str) -> Result<()> {
        // 创建通信通道
        let (tx, rx) = mpsc::channel(10);
        self.sender = Some(tx);
        self.receiver = Some(Arc::new(Mutex::new(rx)));
        
        // 在实际实现中，这里会建立WebSocket或HTTP连接
        println!("连接到MCP服务器: {}", server_url);
        
        // 发送握手消息
        let handshake = McpMessage::Handshake {
            version: "1.0".to_string(),
            server_info: None,
        };
        
        self.send_message(handshake).await?;
        
        // 启动消息处理循环
        self.spawn_message_handler();
        
        Ok(())
    }
    
    /// 启动消息处理循环
    fn spawn_message_handler(&self) {
        // 克隆必要的数据用于消息处理任务
        let receiver = self.receiver.as_ref().unwrap().clone();
        let pending_responses = self.pending_responses.clone();
        
        // 在实际应用中，这会在单独的线程或任务中运行
        // 为简化展示，这里只展示逻辑结构
        std::thread::spawn(move || {
            let mut rx = receiver.lock().unwrap();
            
            while let Some(msg) = rx.try_recv().ok() {
                match parse_mcp_message(&msg) {
                    Ok(mcp_msg) => {
                        match &mcp_msg {
                            McpMessage::ToolResponse { call_id, .. } | 
                            McpMessage::ResourceResponse { request_id: call_id, .. } => {
                                // 查找并完成待处理的响应
                                let mut pending = pending_responses.lock().unwrap();
                                if let Some(sender) = pending.remove(call_id) {
                                    let _ = sender.send(Ok(mcp_msg));
                                }
                            },
                            McpMessage::Error { reference_id: Some(id), code, message } => {
                                // 处理针对特定请求的错误
                                let mut pending = pending_responses.lock().unwrap();
                                if let Some(sender) = pending.remove(id) {
                                    let _ = sender.send(Err(McpError::ServerError { 
                                        code: code.clone(), 
                                        message: message.clone() 
                                    }));
                                }
                            },
                            _ => {
                                // 处理其他消息类型
                            }
                        }
                    },
                    Err(e) => {
                        println!("解析消息失败: {}", e);
                    }
                }
            }
        });
    }
    
    /// 发送消息到服务器
    async fn send_message(&self, message: McpMessage) -> Result<()> {
        if !self.connected && !matches!(message, McpMessage::Handshake { .. }) {
            return Err(McpError::Disconnected);
        }
        
        let json = serialize_mcp_message(&message)
            .map_err(|e| McpError::ProtocolError(format!("序列化消息失败: {}", e)))?;
            
        if let Some(sender) = &self.sender {
            sender.send(json).await
                .map_err(|_| McpError::CommunicationError("发送消息失败".to_string()))?;
            Ok(())
        } else {
            Err(McpError::Disconnected)
        }
    }
    
    /// 调用工具
    pub async fn call_tool(&self, name: &str, parameters: HashMap<String, serde_json::Value>) -> Result<McpResponse> {
        if !self.connected {
            return Err(McpError::Disconnected);
        }
        
        // 创建唯一ID
        let call_id = Uuid::new_v4().to_string();
        
        // 设置接收通道
        let (tx, rx) = oneshot::channel();
        {
            let mut pending = self.pending_responses.lock().unwrap();
            pending.insert(call_id.clone(), tx);
        }
        
        // 创建并发送工具调用消息
        let message = McpMessage::ToolCall {
            call_id: call_id.clone(),
            name: name.to_string(),
            parameters,
        };
        
        // 通知React Native有工具调用
        if let McpMessage::ToolCall { call_id, name, parameters } = &message {
            self.send_event_to_rn(McpEvent::ToolCall { 
                call_id: call_id.clone(), 
                name: name.clone(), 
                parameters: parameters.clone() 
            });
        }
        
        self.send_message(message).await?;
        
        // 等待响应
        match rx.await {
            Ok(result) => {
                match result {
                    Ok(McpMessage::ToolResponse { response, .. }) => Ok(response),
                    Ok(_) => Err(McpError::ProtocolError("收到非预期响应类型".to_string())),
                    Err(e) => Err(e),
                }
            },
            Err(_) => Err(McpError::InternalError("响应通道已关闭".to_string())),
        }
    }
    
    /// 请求资源
    pub async fn request_resource(&self, uri: &str) -> Result<McpResource> {
        if !self.connected {
            return Err(McpError::Disconnected);
        }
        
        // 创建唯一ID
        let request_id = Uuid::new_v4().to_string();
        
        // 设置接收通道
        let (tx, rx) = oneshot::channel();
        {
            let mut pending = self.pending_responses.lock().unwrap();
            pending.insert(request_id.clone(), tx);
        }
        
        // 创建并发送资源请求消息
        let message = McpMessage::ResourceRequest {
            request_id: request_id.clone(),
            uri: uri.to_string(),
        };
        
        // 通知React Native有资源请求
        self.send_event_to_rn(McpEvent::ResourceRequest { 
            request_id: request_id.clone(), 
            uri: uri.to_string() 
        });
        
        self.send_message(message).await?;
        
        // 等待响应
        match rx.await {
            Ok(result) => {
                match result {
                    Ok(McpMessage::ResourceResponse { resource, .. }) => Ok(resource),
                    Ok(_) => Err(McpError::ProtocolError("收到非预期响应类型".to_string())),
                    Err(e) => Err(e),
                }
            },
            Err(_) => Err(McpError::InternalError("响应通道已关闭".to_string())),
        }
    }
    
    /// 断开连接
    pub async fn disconnect(&mut self) -> Result<()> {
        self.connected = false;
        self.server_info = None;
        
        // 清理通道
        self.sender = None;
        self.receiver = None;
        
        // 通知React Native连接已断开
        self.send_event_to_rn(McpEvent::ConnectionState { 
            connected: false, 
            server_name: None,
        });
        
        Ok(())
    }
    
    /// 获取服务器信息
    pub fn get_server_info(&self) -> Option<McpServerInfo> {
        self.server_info.clone()
    }
    
    /// 检查是否已连接
    pub fn is_connected(&self) -> bool {
        self.connected
    }
}

/// 为了示例的完整性，这里包含了一些FFI样板代码
/// 实际应用中需要使用具体的React Native FFI绑定
mod ffi {
    use super::*;
    
    #[no_mangle]
    pub extern "C" fn mcp_client_create() -> *mut McpClient {
        let client = Box::new(McpClient::new());
        Box::into_raw(client)
    }
    
    #[no_mangle]
    pub extern "C" fn mcp_client_destroy(client: *mut McpClient) {
        if !client.is_null() {
            unsafe {
                drop(Box::from_raw(client));
            }
        }
    }
    
    #[no_mangle]
    pub extern "C" fn mcp_client_connect(client: *mut McpClient, server_url: *const libc::c_char) -> bool {
        if client.is_null() || server_url.is_null() {
            return false;
        }
        
        unsafe {
            let client = &mut *client;
            let server_url = std::ffi::CStr::from_ptr(server_url).to_string_lossy().into_owned();
            
            // 实际应用中应该使用适当的异步运行时来执行这个操作
            // 这里只是示例
            match futures::executor::block_on(client.connect(&server_url)) {
                Ok(_) => true,
                Err(_) => false,
            }
        }
    }
    
    #[no_mangle]
    pub extern "C" fn mcp_client_handle_input(client: *mut McpClient, message: *const libc::c_char) -> bool {
        if client.is_null() || message.is_null() {
            return false;
        }
        
        unsafe {
            let client = &mut *client;
            let message = std::ffi::CStr::from_ptr(message).to_string_lossy().into_owned();
            
            match client.handle_input_from_rn(&message) {
                Ok(_) => true,
                Err(_) => false,
            }
        }
    }
    
    // 这里需要添加更多FFI函数来暴露客户端的其他功能...
}

// 为编译需要添加这些导入和模块，在实际应用中会使用真实的crate
mod oneshot {
    use std::sync::mpsc;
    
    pub struct Sender<T>(mpsc::Sender<T>);
    
    impl<T> Sender<T> {
        pub fn send(self, t: T) -> Result<(), mpsc::SendError<T>> {
            self.0.send(t)
        }
    }
    
    pub struct Receiver<T>(mpsc::Receiver<T>);
    
    impl<T> Receiver<T> {
        pub async fn await(self) -> Result<T, ()> {
            self.0.recv().map_err(|_| ())
        }
    }
    
    pub fn channel<T>() -> (Sender<T>, Receiver<T>) {
        let (tx, rx) = mpsc::channel();
        (Sender(tx), Receiver(rx))
    }
}

mod mpsc {
    use std::sync::mpsc;
    
    pub struct Sender<T>(mpsc::Sender<T>);
    
    impl<T> Sender<T> {
        pub async fn send(&self, t: T) -> Result<(), mpsc::SendError<T>> {
            self.0.send(t)
        }
    }
    
    pub struct Receiver<T>(mpsc::Receiver<T>);
    
    impl<T> Receiver<T> {
        pub fn try_recv(&mut self) -> Result<T, mpsc::TryRecvError> {
            self.0.try_recv()
        }
    }
    
    pub fn channel<T>(_capacity: usize) -> (Sender<T>, Receiver<T>) {
        let (tx, rx) = mpsc::channel();
        (Sender(tx), Receiver(rx))
    }
}

mod futures {
    pub mod executor {
        pub fn block_on<F, T>(future: F) -> T 
        where 
            F: std::future::Future<Output = T> {
            // 简化的实现，实际上应该使用真正的异步运行时
            panic!("block_on未真正实现");
        }
    }
} 