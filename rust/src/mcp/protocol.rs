use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// MCP消息类型定义
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum McpMessage {
    /// 工具调用请求
    #[serde(rename = "tool_call")]
    ToolCall {
        /// 调用ID
        call_id: String,
        /// 工具名称
        name: String,
        /// 参数
        #[serde(default)]
        parameters: HashMap<String, serde_json::Value>,
    },
    
    /// 工具调用响应
    #[serde(rename = "tool_response")]
    ToolResponse {
        /// 调用ID
        call_id: String,
        /// 响应内容
        response: McpResponse,
    },
    
    /// 资源请求
    #[serde(rename = "resource_request")]
    ResourceRequest {
        /// 请求ID
        request_id: String,
        /// 资源URI
        uri: String,
    },
    
    /// 资源响应
    #[serde(rename = "resource_response")]
    ResourceResponse {
        /// 请求ID
        request_id: String,
        /// 资源内容
        resource: McpResource,
    },
    
    /// 错误消息
    #[serde(rename = "error")]
    Error {
        /// 错误代码
        code: String,
        /// 错误消息
        message: String,
        /// 相关ID (可选)
        reference_id: Option<String>,
    },
    
    /// 握手消息
    #[serde(rename = "handshake")]
    Handshake {
        /// 协议版本
        version: String,
        /// 服务器信息
        server_info: Option<McpServerInfo>,
    },
}

/// MCP响应结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpResponse {
    /// 响应内容
    pub content: Vec<McpContent>,
    /// 元数据 (可选)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

/// MCP内容块
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpContent {
    /// 内容类型
    #[serde(rename = "type")]
    pub content_type: String,
    /// 文本内容 (对于text类型)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    /// 其他属性
    #[serde(flatten)]
    pub attributes: HashMap<String, serde_json::Value>,
}

/// MCP资源
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpResource {
    /// 资源内容块列表
    pub contents: Vec<McpResourceContent>,
    /// 元数据 (可选)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

/// MCP资源内容
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpResourceContent {
    /// 资源URI
    pub uri: String,
    /// 文本内容
    pub text: String,
    /// MIME类型 (可选)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mime_type: Option<String>,
}

/// MCP工具定义
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpTool {
    /// 工具名称
    pub name: String,
    /// 工具描述
    pub description: String,
    /// 参数模式 (JSON Schema格式)
    pub parameters_schema: serde_json::Value,
}

/// MCP服务器信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpServerInfo {
    /// 服务器名称
    pub name: String,
    /// 服务器版本
    pub version: String,
    /// 可用工具列表
    #[serde(default)]
    pub tools: Vec<McpTool>,
}

/// 将JSON字符串转换为MCP消息
pub fn parse_mcp_message(json: &str) -> Result<McpMessage, serde_json::Error> {
    serde_json::from_str(json)
}

/// 将MCP消息转换为JSON字符串
pub fn serialize_mcp_message(message: &McpMessage) -> Result<String, serde_json::Error> {
    serde_json::to_string(message)
}

/// 快速创建文本内容块
pub fn text_content(text: &str) -> McpContent {
    McpContent {
        content_type: "text".to_string(),
        text: Some(text.to_string()),
        attributes: HashMap::new(),
    }
} 