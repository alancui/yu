use std::sync::{Arc, Mutex};
use crate::mcp::client::{McpClient, McpError, RNCallback};
use crate::mcp::protocol::{McpMessage, McpResource, McpResponse, parse_mcp_message};
use std::collections::HashMap;
use serde_json::{json, Value};

// React Native FFI 依赖
#[cfg(target_os = "android")]
use jni::JNIEnv;
#[cfg(target_os = "android")]
use jni::objects::{JClass, JObject, JString};
#[cfg(target_os = "android")]
use jni::sys::{jboolean, jlong, jobject, jstring};

#[cfg(target_os = "ios")]
use std::os::raw::{c_char, c_void};
#[cfg(target_os = "ios")]
use std::ffi::{CStr, CString};

// 全局客户端实例
lazy_static::lazy_static! {
    static ref MCP_CLIENT: Arc<Mutex<Option<McpClient>>> = Arc::new(Mutex::new(None));
}

// 定义回调类型
type RnCallbackFn = Box<dyn Fn(String) -> () + Send + Sync>;

// 全局事件回调
lazy_static::lazy_static! {
    static ref EVENT_CALLBACKS: Arc<Mutex<HashMap<String, RnCallbackFn>>> = Arc::new(Mutex::new(HashMap::new()));
}

// 添加事件回调
fn register_event_callback(event_name: &str, callback: RnCallbackFn) {
    let mut callbacks = EVENT_CALLBACKS.lock().unwrap();
    callbacks.insert(event_name.to_string(), callback);
}

// 触发事件回调
fn emit_event(event_name: &str, data: &str) {
    let callbacks = EVENT_CALLBACKS.lock().unwrap();
    if let Some(callback) = callbacks.get(event_name) {
        callback(data.to_string());
    }
}

// ===== 错误处理和重试 =====

// 重试配置
#[derive(Clone, Debug)]
struct RetryConfig {
    max_retries: usize,
    initial_delay_ms: u64,
    backoff_factor: f64,
    max_delay_ms: u64,
}

impl Default for RetryConfig {
    fn default() -> Self {
        RetryConfig {
            max_retries: 3,
            initial_delay_ms: 500,
            backoff_factor: 1.5,
            max_delay_ms: 5000,
        }
    }
}

// 异步重试函数
async fn retry_async<F, Fut, T, E>(
    operation: F,
    config: RetryConfig,
    should_retry: fn(&E) -> bool,
) -> Result<T, E>
where
    F: Fn() -> Fut,
    Fut: std::future::Future<Output = Result<T, E>>,
{
    let mut last_error = None;
    let mut delay_ms = config.initial_delay_ms;

    for retry in 0..=config.max_retries {
        match operation().await {
            Ok(value) => return Ok(value),
            Err(err) => {
                if retry == config.max_retries || !should_retry(&err) {
                    return Err(err);
                }

                last_error = Some(err);
                
                // 等待延迟时间
                #[cfg(not(target_arch = "wasm32"))]
                {
                    std::thread::sleep(std::time::Duration::from_millis(delay_ms));
                }
                
                // 增加延迟时间（指数退避）
                delay_ms = std::cmp::min(
                    (delay_ms as f64 * config.backoff_factor) as u64,
                    config.max_delay_ms,
                );
            }
        }
    }

    // 应该永远不会到达这里，但为了编译器类型检查
    Err(last_error.unwrap())
}

// 判断错误是否可重试
fn is_error_retryable(error: &McpError) -> bool {
    match error {
        McpError::ConnectionError(_) => true,
        McpError::CommunicationError(_) => true,
        McpError::Timeout => true,
        McpError::ServerError { code, .. } => {
            // 服务器错误码为5xx时可重试
            code.starts_with("5")
        }
        _ => false,
    }
}

// ===== Android 平台接口 =====

#[cfg(target_os = "android")]
#[no_mangle]
pub extern "system" fn Java_com_your_app_RustMcpClientModule_initClient(
    _env: JNIEnv,
    _class: JClass,
) -> jlong {
    let client = McpClient::new();
    let mut global_client = MCP_CLIENT.lock().unwrap();
    *global_client = Some(client);
    
    // 返回一个非零值表示成功
    1
}

#[cfg(target_os = "android")]
#[no_mangle]
pub extern "system" fn Java_com_your_app_RustMcpClientModule_connect(
    env: JNIEnv,
    _class: JClass,
    server_url: JString,
) -> jboolean {
    let server_url: String = env.get_string(server_url).unwrap().into();
    
    let mut client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_mut() {
        // 使用异步运行时阻塞执行
        let result = futures::executor::block_on(async {
            let retry_config = RetryConfig::default();
            retry_async(
                || async { client.connect(&server_url).await },
                retry_config,
                is_error_retryable
            ).await
        });
        
        match result {
            Ok(_) => 1, // true
            Err(_) => 0, // false
        }
    } else {
        0 // false
    }
}

#[cfg(target_os = "android")]
#[no_mangle]
pub extern "system" fn Java_com_your_app_RustMcpClientModule_disconnect(
    _env: JNIEnv,
    _class: JClass,
) -> jboolean {
    let mut client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_mut() {
        let result = futures::executor::block_on(client.disconnect());
        match result {
            Ok(_) => 1, // true
            Err(_) => 0, // false
        }
    } else {
        1 // 已断开连接视为成功
    }
}

#[cfg(target_os = "android")]
#[no_mangle]
pub extern "system" fn Java_com_your_app_RustMcpClientModule_isConnected(
    _env: JNIEnv,
    _class: JClass,
) -> jboolean {
    let client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_ref() {
        if client.is_connected() { 1 } else { 0 }
    } else {
        0 // false
    }
}

#[cfg(target_os = "android")]
#[no_mangle]
pub extern "system" fn Java_com_your_app_RustMcpClientModule_callTool(
    env: JNIEnv,
    _class: JClass,
    tool_name: JString,
    parameters_json: JString,
) -> jstring {
    let tool_name: String = env.get_string(tool_name).unwrap().into();
    let parameters_str: String = env.get_string(parameters_json).unwrap().into();
    
    // 解析参数
    let parameters: HashMap<String, Value> = match serde_json::from_str(&parameters_str) {
        Ok(params) => params,
        Err(_) => {
            let error_json = json!({
                "error": {
                    "code": "invalid_params",
                    "message": "无法解析工具参数"
                }
            }).to_string();
            return env.new_string(error_json).unwrap().into_inner();
        }
    };
    
    let client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_ref() {
        // 调用工具并处理结果
        let result = futures::executor::block_on(async {
            let retry_config = RetryConfig::default();
            retry_async(
                || async { client.call_tool(&tool_name, parameters.clone()).await },
                retry_config,
                is_error_retryable
            ).await
        });
        
        let response_json = match result {
            Ok(response) => {
                match serde_json::to_string(&response) {
                    Ok(json) => json,
                    Err(_) => json!({
                        "error": {
                            "code": "serialization_error",
                            "message": "无法序列化响应"
                        }
                    }).to_string(),
                }
            },
            Err(err) => {
                json!({
                    "error": {
                        "code": "tool_call_error",
                        "message": err.to_string()
                    }
                }).to_string()
            }
        };
        
        env.new_string(response_json).unwrap().into_inner()
    } else {
        let error_json = json!({
            "error": {
                "code": "client_not_initialized",
                "message": "MCP客户端未初始化"
            }
        }).to_string();
        
        env.new_string(error_json).unwrap().into_inner()
    }
}

#[cfg(target_os = "android")]
#[no_mangle]
pub extern "system" fn Java_com_your_app_RustMcpClientModule_requestResource(
    env: JNIEnv,
    _class: JClass,
    uri: JString,
) -> jstring {
    let uri: String = env.get_string(uri).unwrap().into();
    
    let client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_ref() {
        // 请求资源并处理结果
        let result = futures::executor::block_on(async {
            let retry_config = RetryConfig::default();
            retry_async(
                || async { client.request_resource(&uri).await },
                retry_config,
                is_error_retryable
            ).await
        });
        
        let response_json = match result {
            Ok(resource) => {
                match serde_json::to_string(&resource) {
                    Ok(json) => json,
                    Err(_) => json!({
                        "error": {
                            "code": "serialization_error",
                            "message": "无法序列化资源"
                        }
                    }).to_string(),
                }
            },
            Err(err) => {
                json!({
                    "error": {
                        "code": "resource_request_error",
                        "message": err.to_string()
                    }
                }).to_string()
            }
        };
        
        env.new_string(response_json).unwrap().into_inner()
    } else {
        let error_json = json!({
            "error": {
                "code": "client_not_initialized",
                "message": "MCP客户端未初始化"
            }
        }).to_string();
        
        env.new_string(error_json).unwrap().into_inner()
    }
}

#[cfg(target_os = "android")]
#[no_mangle]
pub extern "system" fn Java_com_your_app_RustMcpClientModule_getServerInfo(
    env: JNIEnv,
    _class: JClass,
) -> jstring {
    let client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_ref() {
        let server_info = client.get_server_info();
        
        let response_json = match server_info {
            Some(info) => {
                match serde_json::to_string(&info) {
                    Ok(json) => json,
                    Err(_) => json!({
                        "error": {
                            "code": "serialization_error",
                            "message": "无法序列化服务器信息"
                        }
                    }).to_string(),
                }
            },
            None => "null".to_string(),
        };
        
        env.new_string(response_json).unwrap().into_inner()
    } else {
        let error_json = json!({
            "error": {
                "code": "client_not_initialized",
                "message": "MCP客户端未初始化"
            }
        }).to_string();
        
        env.new_string(error_json).unwrap().into_inner()
    }
}

#[cfg(target_os = "android")]
#[no_mangle]
pub extern "system" fn Java_com_your_app_RustMcpClientModule_handleInputFromRN(
    env: JNIEnv,
    _class: JClass,
    message: JString,
) -> jboolean {
    let message: String = env.get_string(message).unwrap().into();
    
    let mut client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_mut() {
        match client.handle_input_from_rn(&message) {
            Ok(_) => 1, // true
            Err(_) => 0, // false
        }
    } else {
        0 // false
    }
}

#[cfg(target_os = "android")]
#[no_mangle]
pub extern "system" fn Java_com_your_app_RustMcpClientModule_registerEventCallback(
    env: JNIEnv,
    _class: JClass,
    event_name: JString,
    callback_obj: JObject,
) -> jboolean {
    let event_name: String = env.get_string(event_name).unwrap().into();
    
    let callback_ref = env.new_global_ref(callback_obj).unwrap();
    let jvm = env.get_java_vm().unwrap();
    
    let callback = Box::new(move |data: String| {
        let env = jvm.attach_current_thread().unwrap();
        let data_jstring = env.new_string(data).unwrap();
        
        let callback_obj = callback_ref.as_obj();
        let _result = env.call_method(
            callback_obj,
            "invoke",
            "(Ljava/lang/String;)V",
            &[(&data_jstring).into()]
        );
    });
    
    register_event_callback(&event_name, callback);
    
    // 为MCP客户端设置回调
    let mut client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_mut() {
        let callback_id = format!("rn_callback_{}", event_name);
        client.set_rn_callback(RNCallback {
            callback_id: callback_id.clone(),
            handler: Arc::new(move |json| {
                emit_event(&event_name, &json);
            }),
        });
    }
    
    1 // true
}

// ===== iOS 平台接口 =====

#[cfg(target_os = "ios")]
#[no_mangle]
pub extern "C" fn mcp_init_client() -> bool {
    let client = McpClient::new();
    let mut global_client = MCP_CLIENT.lock().unwrap();
    *global_client = Some(client);
    true
}

#[cfg(target_os = "ios")]
#[no_mangle]
pub extern "C" fn mcp_connect(server_url: *const c_char) -> bool {
    let c_str = unsafe { CStr::from_ptr(server_url) };
    let server_url = c_str.to_str().unwrap().to_string();
    
    let mut client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_mut() {
        // 使用异步运行时阻塞执行
        let result = futures::executor::block_on(async {
            let retry_config = RetryConfig::default();
            retry_async(
                || async { client.connect(&server_url).await },
                retry_config,
                is_error_retryable
            ).await
        });
        
        match result {
            Ok(_) => true,
            Err(_) => false,
        }
    } else {
        false
    }
}

#[cfg(target_os = "ios")]
#[no_mangle]
pub extern "C" fn mcp_disconnect() -> bool {
    let mut client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_mut() {
        let result = futures::executor::block_on(client.disconnect());
        match result {
            Ok(_) => true,
            Err(_) => false,
        }
    } else {
        true // 已断开连接视为成功
    }
}

#[cfg(target_os = "ios")]
#[no_mangle]
pub extern "C" fn mcp_is_connected() -> bool {
    let client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_ref() {
        client.is_connected()
    } else {
        false
    }
}

#[cfg(target_os = "ios")]
#[no_mangle]
pub extern "C" fn mcp_call_tool(tool_name: *const c_char, parameters_json: *const c_char) -> *mut c_char {
    let tool_name_cstr = unsafe { CStr::from_ptr(tool_name) };
    let parameters_cstr = unsafe { CStr::from_ptr(parameters_json) };
    
    let tool_name = tool_name_cstr.to_str().unwrap().to_string();
    let parameters_str = parameters_cstr.to_str().unwrap().to_string();
    
    // 解析参数
    let parameters: HashMap<String, Value> = match serde_json::from_str(&parameters_str) {
        Ok(params) => params,
        Err(_) => {
            let error_json = json!({
                "error": {
                    "code": "invalid_params",
                    "message": "无法解析工具参数"
                }
            }).to_string();
            
            return CString::new(error_json).unwrap().into_raw();
        }
    };
    
    let client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_ref() {
        // 调用工具并处理结果
        let result = futures::executor::block_on(async {
            let retry_config = RetryConfig::default();
            retry_async(
                || async { client.call_tool(&tool_name, parameters.clone()).await },
                retry_config,
                is_error_retryable
            ).await
        });
        
        let response_json = match result {
            Ok(response) => {
                match serde_json::to_string(&response) {
                    Ok(json) => json,
                    Err(_) => json!({
                        "error": {
                            "code": "serialization_error",
                            "message": "无法序列化响应"
                        }
                    }).to_string(),
                }
            },
            Err(err) => {
                json!({
                    "error": {
                        "code": "tool_call_error",
                        "message": err.to_string()
                    }
                }).to_string()
            }
        };
        
        CString::new(response_json).unwrap().into_raw()
    } else {
        let error_json = json!({
            "error": {
                "code": "client_not_initialized",
                "message": "MCP客户端未初始化"
            }
        }).to_string();
        
        CString::new(error_json).unwrap().into_raw()
    }
}

#[cfg(target_os = "ios")]
#[no_mangle]
pub extern "C" fn mcp_request_resource(uri: *const c_char) -> *mut c_char {
    let uri_cstr = unsafe { CStr::from_ptr(uri) };
    let uri = uri_cstr.to_str().unwrap().to_string();
    
    let client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_ref() {
        // 请求资源并处理结果
        let result = futures::executor::block_on(async {
            let retry_config = RetryConfig::default();
            retry_async(
                || async { client.request_resource(&uri).await },
                retry_config,
                is_error_retryable
            ).await
        });
        
        let response_json = match result {
            Ok(resource) => {
                match serde_json::to_string(&resource) {
                    Ok(json) => json,
                    Err(_) => json!({
                        "error": {
                            "code": "serialization_error",
                            "message": "无法序列化资源"
                        }
                    }).to_string(),
                }
            },
            Err(err) => {
                json!({
                    "error": {
                        "code": "resource_request_error",
                        "message": err.to_string()
                    }
                }).to_string()
            }
        };
        
        CString::new(response_json).unwrap().into_raw()
    } else {
        let error_json = json!({
            "error": {
                "code": "client_not_initialized",
                "message": "MCP客户端未初始化"
            }
        }).to_string();
        
        CString::new(error_json).unwrap().into_raw()
    }
}

#[cfg(target_os = "ios")]
#[no_mangle]
pub extern "C" fn mcp_get_server_info() -> *mut c_char {
    let client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_ref() {
        let server_info = client.get_server_info();
        
        let response_json = match server_info {
            Some(info) => {
                match serde_json::to_string(&info) {
                    Ok(json) => json,
                    Err(_) => json!({
                        "error": {
                            "code": "serialization_error",
                            "message": "无法序列化服务器信息"
                        }
                    }).to_string(),
                }
            },
            None => "null".to_string(),
        };
        
        CString::new(response_json).unwrap().into_raw()
    } else {
        let error_json = json!({
            "error": {
                "code": "client_not_initialized",
                "message": "MCP客户端未初始化"
            }
        }).to_string();
        
        CString::new(error_json).unwrap().into_raw()
    }
}

#[cfg(target_os = "ios")]
#[no_mangle]
pub extern "C" fn mcp_handle_input_from_rn(message: *const c_char) -> bool {
    let message_cstr = unsafe { CStr::from_ptr(message) };
    let message = message_cstr.to_str().unwrap().to_string();
    
    let mut client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_mut() {
        match client.handle_input_from_rn(&message) {
            Ok(_) => true,
            Err(_) => false,
        }
    } else {
        false
    }
}

// iOS回调函数类型
#[cfg(target_os = "ios")]
type EventCallbackFn = extern "C" fn(*const c_char, *mut c_void);

#[cfg(target_os = "ios")]
#[no_mangle]
pub extern "C" fn mcp_register_event_callback(
    event_name: *const c_char,
    callback: EventCallbackFn,
    context: *mut c_void,
) -> bool {
    let event_name_cstr = unsafe { CStr::from_ptr(event_name) };
    let event_name = event_name_cstr.to_str().unwrap().to_string();
    
    let callback_box = Box::new(move |data: String| {
        let c_data = CString::new(data).unwrap();
        unsafe {
            callback(c_data.as_ptr(), context);
        }
    });
    
    register_event_callback(&event_name, callback_box);
    
    // 为MCP客户端设置回调
    let mut client_guard = MCP_CLIENT.lock().unwrap();
    if let Some(client) = client_guard.as_mut() {
        let callback_id = format!("rn_callback_{}", event_name);
        client.set_rn_callback(RNCallback {
            callback_id: callback_id.clone(),
            handler: Arc::new(move |json| {
                emit_event(&event_name, &json);
            }),
        });
    }
    
    true
}

// 释放字符串（iOS平台需要）
#[cfg(target_os = "ios")]
#[no_mangle]
pub extern "C" fn mcp_free_string(ptr: *mut c_char) {
    if !ptr.is_null() {
        unsafe {
            let _ = CString::from_raw(ptr);
        }
    }
} 