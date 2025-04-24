mod protocol;
mod client;

pub use client::McpClient;
pub use protocol::{McpMessage, McpTool, McpResource, McpResponse};

#[cfg(test)]
mod tests; 