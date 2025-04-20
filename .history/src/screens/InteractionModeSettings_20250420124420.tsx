import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { SettingBlock } from '../components/SettingBlock';
import { RadioOption } from '../components/RadioOption';
import { Text } from '../components/Text';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../stores/settingsStore';

export const InteractionModeSettings: React.FC = () => {
  const { colors } = useTheme();
  const { defaultInteractionMode, setDefaultInteractionMode } = useSettingsStore();

  const handleSelect = (value: string) => {
    setDefaultInteractionMode(value as 'voice' | 'text');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderBar title="默认交互模式" />
      
      <ScrollView style={styles.container}>
        <SettingBlock>
          <RadioOption
            value="voice"
            label="语音交互模式"
            description="启动应用时默认进入语音交互界面，适合纯语音操作场景"
            isSelected={defaultInteractionMode === 'voice'}
            onSelect={handleSelect}
          />
          <RadioOption
            value="text"
            label="文字交互模式"
            description="启动应用时默认进入文字交互界面，适合需要查看历史记录或文字输入场景"
            isSelected={defaultInteractionMode === 'text'}
            onSelect={handleSelect}
          />
        </SettingBlock>

        <View style={styles.descriptionContainer}>
          <Text style={[styles.descriptionText, { color: colors.secondaryText }]}>
            您可以随时通过界面上的按钮在语音和文字模式之间切换。该设置仅影响应用启动时默认显示的界面。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  descriptionContainer: {
    padding: 20,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 