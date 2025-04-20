import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 中文资源
const zhResources = {
  translation: {
    settings: '设置',
    voice: '语音',
    text: '文字',
    send: '发送',
    recording: '录音中',
    inputPlaceholder: '输入消息...',
    connectionStatus: {
      connected: '已连接',
      disconnected: '未连接',
    },
    settingsSection: {
      interaction: '交互偏好设置',
      language: '语言设置',
      triage: 'Triage 设置',
      interface: '界面设置',
      about: '关于',
    },
    settingsItem: {
      defaultMode: '默认交互模式',
      autoPlayVoice: '自动播放语音',
      voiceRecognition: '语音识别设置',
      defaultDialogueLanguage: '默认对话语言',
      voiceRecognitionLanguage: '语音识别语言',
      interfaceLanguage: '界面语言',
      promptEditor: 'Prompt 编辑器',
      targetSystem: '目标系统设置',
      darkMode: '深色模式',
      fontSize: '字体大小',
      widgetConfig: 'Widget 配置',
      version: '版本',
      privacyPolicy: '隐私政策',
      userAgreement: '用户协议',
    },
  },
};

// 初始化 i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: zhResources,
    },
    lng: 'zh', // 默认语言
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false, // 不转义 HTML
    },
  });

export default i18n; 