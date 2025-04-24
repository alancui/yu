// 导出核心服务实例
import { mockServer } from './mockServer';
import { mcpClientBridge } from './mcpBridge';
import { textProcessingService } from './textProcessingService';
import { transcriptionService } from './transcriptionService';
import { serviceProvider } from './ServiceProvider';

// 导出类型和工具函数
export { OperationResult, TranscriptionResult } from './mockServer';
export { McpEventType, McpError, McpResponse, McpContent } from './mcpBridge';
export { ServiceProvider, serviceProvider } from './ServiceProvider';

// 接口导出
export {
  IMcpService,
  IMcpServiceFactory,
  IMcpServiceConfig
} from './interfaces/IMcpService';

export {
  IApiClient,
  IApiClientFactory,
  IApiClientConfig
} from './interfaces/IApiClient';

// 服务工厂导出
export {
  mockMcpServiceFactory
} from './implementations/MockMcpService';

export {
  mockApiClientFactory
} from './implementations/MockApiClient';

// 统一导出所有服务的对象
export const services = {
  mockServer,
  mcpClientBridge,
  textProcessingService,
  transcriptionService,
  serviceProvider
};

export default services; 