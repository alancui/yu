import { IMcpService, IMcpServiceFactory } from './interfaces/IMcpService';
import { IApiClient, IApiClientFactory } from './interfaces/IApiClient';
import { mockMcpServiceFactory } from './implementations/MockMcpService';
import { mockApiClientFactory } from './implementations/MockApiClient';

/**
 * 服务提供者类
 * 统一管理应用中使用的各种服务实例
 */
export class ServiceProvider {
  private static instance: ServiceProvider;
  
  private mcpServiceFactory: IMcpServiceFactory;
  private apiClientFactory: IApiClientFactory;
  
  private mcpService: IMcpService | null = null;
  private apiClient: IApiClient | null = null;
  
  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {
    // 默认使用mock实现
    this.mcpServiceFactory = mockMcpServiceFactory;
    this.apiClientFactory = mockApiClientFactory;
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(): ServiceProvider {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider();
    }
    return ServiceProvider.instance;
  }
  
  /**
   * 获取MCP服务实例
   */
  public getMcpService(): IMcpService {
    if (!this.mcpService) {
      this.mcpService = this.mcpServiceFactory.createMcpService();
    }
    return this.mcpService;
  }
  
  /**
   * 获取API客户端实例
   */
  public getApiClient(): IApiClient {
    if (!this.apiClient) {
      this.apiClient = this.apiClientFactory.createApiClient();
    }
    return this.apiClient;
  }
  
  /**
   * 设置MCP服务工厂
   * 用于在不同的实现之间切换，例如从mock切换到真实实现
   */
  public setMcpServiceFactory(factory: IMcpServiceFactory): void {
    this.mcpServiceFactory = factory;
    this.mcpService = null; // 清除现有实例，以便下次获取时创建新的实例
  }
  
  /**
   * 设置API客户端工厂
   * 用于在不同的实现之间切换，例如从mock切换到真实实现
   */
  public setApiClientFactory(factory: IApiClientFactory): void {
    this.apiClientFactory = factory;
    this.apiClient = null; // 清除现有实例，以便下次获取时创建新的实例
  }
  
  /**
   * 配置MCP服务
   */
  public configureMcpService(config: any): void {
    this.mcpServiceFactory.setServiceConfig(config);
  }
  
  /**
   * 配置API客户端
   */
  public configureApiClient(config: any): void {
    this.apiClientFactory.setClientConfig(config);
  }
  
  /**
   * 清理所有服务资源
   */
  public cleanup(): void {
    if (this.mcpService) {
      this.mcpService.cleanup();
      this.mcpService = null;
    }
    this.apiClient = null;
  }
}

// 导出单例实例，方便使用
export const serviceProvider = ServiceProvider.getInstance(); 