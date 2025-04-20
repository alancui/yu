import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type InteractionMode = 'voice' | 'text';
type RecognitionModel = 'standard' | 'high-precision';
type VoiceType = 'male' | 'female';
type Language = 'zh' | 'en' | 'ja';
type WidgetSize = 'small' | 'medium' | 'large';

interface SettingsState {
  // 交互偏好设置
  defaultInteractionMode: InteractionMode;
  autoPlayVoice: boolean;
  voiceType: VoiceType;
  playbackSpeed: number;
  playbackVolume: number;
  recognitionModel: RecognitionModel;
  recognitionSensitivity: number;
  autoStopRecordingTime: number;
  
  // 语言设置
  dialogueLanguage: Language;
  recognitionLanguage: Language;
  interfaceLanguage: Language;
  
  // 界面设置
  isDarkMode: boolean;
  fontSize: number;
  
  // Widget 设置
  widgetSize: WidgetSize;
  showRecentConversation: boolean;
  showQuickActions: boolean;
  showRecordingStatus: boolean;
  
  // 更新函数
  setDefaultInteractionMode: (mode: InteractionMode) => void;
  setVoicePlaybackSettings: (settings: {
    autoPlay?: boolean;
    voiceType?: VoiceType;
    speed?: number;
    volume?: number;
  }) => void;
  setVoiceRecognitionSettings: (settings: {
    model?: RecognitionModel;
    sensitivity?: number;
    autoStopTime?: number;
  }) => void;
  setLanguageSettings: (settings: {
    dialogue?: Language;
    recognition?: Language;
    interface?: Language;
  }) => void;
  setInterfaceSettings: (settings: {
    darkMode?: boolean;
    fontSize?: number;
  }) => void;
  setWidgetSettings: (settings: {
    size?: WidgetSize;
    showRecentConversation?: boolean;
    showQuickActions?: boolean;
    showRecordingStatus?: boolean;
  }) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // 默认值
      defaultInteractionMode: 'voice',
      autoPlayVoice: true,
      voiceType: 'female',
      playbackSpeed: 1.0,
      playbackVolume: 0.8,
      recognitionModel: 'standard',
      recognitionSensitivity: 0.7,
      autoStopRecordingTime: 2.0,
      
      dialogueLanguage: 'zh',
      recognitionLanguage: 'zh',
      interfaceLanguage: 'zh',
      
      isDarkMode: false,
      fontSize: 1.0,
      
      widgetSize: 'medium',
      showRecentConversation: true,
      showQuickActions: true,
      showRecordingStatus: true,
      
      // 更新函数
      setDefaultInteractionMode: (mode) => set({ defaultInteractionMode: mode }),
      
      setVoicePlaybackSettings: (settings) => set((state) => ({
        autoPlayVoice: settings.autoPlay !== undefined ? settings.autoPlay : state.autoPlayVoice,
        voiceType: settings.voiceType || state.voiceType,
        playbackSpeed: settings.speed !== undefined ? settings.speed : state.playbackSpeed,
        playbackVolume: settings.volume !== undefined ? settings.volume : state.playbackVolume,
      })),
      
      setVoiceRecognitionSettings: (settings) => set((state) => ({
        recognitionModel: settings.model || state.recognitionModel,
        recognitionSensitivity: settings.sensitivity !== undefined ? settings.sensitivity : state.recognitionSensitivity,
        autoStopRecordingTime: settings.autoStopTime !== undefined ? settings.autoStopTime : state.autoStopRecordingTime,
      })),
      
      setLanguageSettings: (settings) => set((state) => ({
        dialogueLanguage: settings.dialogue || state.dialogueLanguage,
        recognitionLanguage: settings.recognition || state.recognitionLanguage,
        interfaceLanguage: settings.interface || state.interfaceLanguage,
      })),
      
      setInterfaceSettings: (settings) => set((state) => ({
        isDarkMode: settings.darkMode !== undefined ? settings.darkMode : state.isDarkMode,
        fontSize: settings.fontSize !== undefined ? settings.fontSize : state.fontSize,
      })),
      
      setWidgetSettings: (settings) => set((state) => ({
        widgetSize: settings.size || state.widgetSize,
        showRecentConversation: settings.showRecentConversation !== undefined ? settings.showRecentConversation : state.showRecentConversation,
        showQuickActions: settings.showQuickActions !== undefined ? settings.showQuickActions : state.showQuickActions,
        showRecordingStatus: settings.showRecordingStatus !== undefined ? settings.showRecordingStatus : state.showRecordingStatus,
      })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 