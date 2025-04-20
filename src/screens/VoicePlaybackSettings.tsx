import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Switch } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { SettingBlock } from '../components/SettingBlock';
import { RadioOption } from '../components/RadioOption';
import { SettingSlider } from '../components/SettingSlider';
import { Text } from '../components/Text';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../stores/settingsStore';

export const VoicePlaybackSettings: React.FC = () => {
  const { colors } = useTheme();
  const { 
    autoPlayVoice, 
    voiceType, 
    playbackSpeed, 
    playbackVolume,
    setVoicePlaybackSettings
  } = useSettingsStore();

  const handleAutoPlayChange = (value: boolean) => {
    setVoicePlaybackSettings({ autoPlay: value });
  };

  const handleVoiceTypeSelect = (value: string) => {
    setVoicePlaybackSettings({ voiceType: value as 'male' | 'female' });
  };

  const handleSpeedChange = (value: number) => {
    setVoicePlaybackSettings({ speed: value });
  };

  const handleVolumeChange = (value: number) => {
    setVoicePlaybackSettings({ volume: value });
  };

  const formatSpeed = (value: number) => `${value.toFixed(1)}x`;
  const formatVolume = (value: number) => `${Math.round(value * 100)}%`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderBar title="语音播放设置" />
      
      <ScrollView style={styles.container}>
        <SettingBlock title="自动朗读回复">
          <View style={[styles.switchItem, { borderBottomColor: colors.border }]}>
            <Text style={styles.switchLabel}>自动朗读回复</Text>
            <Switch
              value={autoPlayVoice}
              onValueChange={handleAutoPlayChange}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </SettingBlock>

        <SettingBlock title="语音合成声音" description="选择AI回复朗读时使用的语音类型">
          <RadioOption
            value="female"
            label="女声"
            isSelected={voiceType === 'female'}
            onSelect={handleVoiceTypeSelect}
          />
          <RadioOption
            value="male"
            label="男声"
            isSelected={voiceType === 'male'}
            onSelect={handleVoiceTypeSelect}
          />
        </SettingBlock>

        <SettingBlock title="播放速度" description="调整语音播放的速度">
          <SettingSlider
            title="播放速度"
            value={playbackSpeed}
            minimumValue={0.5}
            maximumValue={2.0}
            step={0.1}
            leftLabel="慢"
            rightLabel="快"
            valueFormatter={formatSpeed}
            onValueChange={handleSpeedChange}
          />
        </SettingBlock>

        <SettingBlock title="播放音量" description="调整语音播放的音量">
          <SettingSlider
            title="播放音量"
            value={playbackVolume}
            minimumValue={0.0}
            maximumValue={1.0}
            step={0.05}
            leftLabel="低"
            rightLabel="高"
            valueFormatter={formatVolume}
            onValueChange={handleVolumeChange}
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
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  switchLabel: {
    fontSize: 17,
  },
}); 