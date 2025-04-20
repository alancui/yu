import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { SettingBlock } from '../components/SettingBlock';
import { RadioOption } from '../components/RadioOption';
import { SettingSlider } from '../components/SettingSlider';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../stores/settingsStore';

export const VoiceRecognitionSettings: React.FC = () => {
  const { colors } = useTheme();
  const { 
    recognitionModel,
    recognitionSensitivity,
    autoStopRecordingTime,
    setVoiceRecognitionSettings
  } = useSettingsStore();

  const handleModelSelect = (value: string) => {
    setVoiceRecognitionSettings({ model: value as 'standard' | 'high-precision' });
  };

  const handleSensitivityChange = (value: number) => {
    setVoiceRecognitionSettings({ sensitivity: value });
  };

  const handleAutoStopTimeChange = (value: number) => {
    setVoiceRecognitionSettings({ autoStopTime: value });
  };

  const formatSensitivity = (value: number) => {
    const percent = Math.round(value * 100);
    if (percent <= 30) return '低';
    if (percent <= 70) return '中';
    return '高';
  };

  const formatTime = (value: number) => `${value.toFixed(1)}秒`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderBar title="语音识别设置" />
      
      <ScrollView style={styles.container}>
        <SettingBlock 
          title="语音识别模型" 
          description="选择语音识别的精度模式，高精度模式提供更准确的识别结果，但消耗更多资源"
        >
          <RadioOption
            value="standard"
            label="标准模式"
            description="速度更快，适合一般场景"
            isSelected={recognitionModel === 'standard'}
            onSelect={handleModelSelect}
          />
          <RadioOption
            value="high-precision"
            label="高精度模式"
            description="识别更精准，适合专业术语或复杂语境"
            isSelected={recognitionModel === 'high-precision'}
            onSelect={handleModelSelect}
          />
        </SettingBlock>

        <SettingBlock 
          title="语音识别灵敏度" 
          description="调整麦克风对声音的敏感度，较高的灵敏度可以在较嘈杂的环境中更好地捕捉语音，但可能增加错误识别的几率"
        >
          <SettingSlider
            title="识别灵敏度"
            value={recognitionSensitivity}
            minimumValue={0.1}
            maximumValue={1.0}
            step={0.05}
            leftLabel="低"
            rightLabel="高"
            valueFormatter={formatSensitivity}
            onValueChange={handleSensitivityChange}
          />
        </SettingBlock>

        <SettingBlock 
          title="自动停止录音时间" 
          description="设置检测到静音后自动停止录音的等待时间，较短的时间可以加快响应速度，较长的时间能够容纳说话中的停顿"
        >
          <SettingSlider
            title="停止等待时间"
            value={autoStopRecordingTime}
            minimumValue={1.0}
            maximumValue={5.0}
            step={0.5}
            leftLabel="短"
            rightLabel="长"
            valueFormatter={formatTime}
            onValueChange={handleAutoStopTimeChange}
          />
        </SettingBlock>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 