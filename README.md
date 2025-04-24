# Omnetix Orbit

一个基于 React Native 和 Rust 的跨平台智能语音助手应用，支持快速语音输入并智能分类为任务、日历事件或笔记。

## 功能特点

- 🎤 高质量音频录制
- 🤖 AI 驱动的语音转文字
- 📝 智能文本分类
- 📅 系统日历集成
- ✅ 提醒事项集成
- 📓 笔记应用集成
- 🔄 跨设备同步
- ⌚️ Apple Watch 支持
- 🔒 锁屏小组件

## 技术栈

- 前端：React Native + TypeScript
- 后端：Rust
- AI：Whisper
- 数据存储：CoreData + iCloud

## 开发环境要求

- Node.js 18+
- Rust 1.75+
- Xcode 15+
- CocoaPods
- Android Studio (可选)

## 安装步骤

1. 克隆仓库
```bash
git clone [repository-url]
cd [repository-name]
```

2. 安装前端依赖
```bash
npm install
```

3. 安装 Rust 依赖
```bash
cd rust
cargo build
```

4. 安装 iOS 依赖
```bash
cd ios
pod install
```

5. 运行开发服务器
```bash
npm start
```

6. 运行应用
```bash
# iOS
npm run ios

# Android
npm run android
```

## 项目结构

```
.
├── src/                # React Native 源代码
│   ├── components/    # UI 组件
│   ├── screens/       # 页面
│   ├── services/      # 服务
│   └── bridges/       # Rust 桥接
├── rust/              # Rust 源代码
│   ├── src/
│   │   ├── audio/    # 音频处理
│   │   ├── ai/       # AI 模型
│   │   └── utils/    # 工具函数
│   └── Cargo.toml
├── ios/               # iOS 原生代码
├── android/           # Android 原生代码
└── docs/             # 文档
```

## 开发指南

详细的开发指南请参考：
- [功能规划](docs/features.md)
- [开发任务](docs/TODO.md)
- [API 文档](docs/api.md)

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

[MIT License](LICENSE)

## 联系方式

- 项目负责人：[Your Name]
- Email：[your.email@example.com] 