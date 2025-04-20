import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { SettingBlock } from '../components/SettingBlock';
import { SettingSlider } from '../components/SettingSlider';
import { Text } from '../components/Text';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../stores/settingsStore';

export const FontSizeSettings: React.FC = () => {
  const { colors } = useTheme();
  const { fontSize, setInterfaceSettings } = useSettingsStore();

  const handleFontSizeChange = (value: number) => {
    setInterfaceSettings({ fontSize: value });
  };

  const handleReset = () => {
    setInterfaceSettings({ fontSize: 1.0 });
  };

  const formatFontSize = (value: number) => {
    if (value < 0.8) return '小';
    if (value < 1.2) return '中';
    return '大';
  };

  // 根据当前字体大小比例调整示例文本大小
  const scaledFontSizes = {
    header: 24 * fontSize,
    subheader: 18 * fontSize,
    body: 16 * fontSize,
    caption: 14 * fontSize,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderBar title="字体大小设置" />
      
      <ScrollView style={styles.container}>
        <SettingBlock description="拖动滑块调整应用内所有文本的显示大小">
          <SettingSlider
            title="字体大小"
            value={fontSize}
            minimumValue={0.6}
            maximumValue={1.4}
            step={0.05}
            leftLabel="小"
            rightLabel="大"
            valueFormatter={formatFontSize}
            onValueChange={handleFontSizeChange}
          />
        </SettingBlock>

        <SettingBlock title="预览" description="以下是不同类型文本在当前字体大小下的显示效果">
          <View style={styles.previewContainer}>
            <Text style={[styles.previewHeader, { fontSize: scaledFontSizes.header }]}>
              标题文本
            </Text>
            <Text style={[styles.previewSubheader, { fontSize: scaledFontSizes.subheader }]}>
              副标题文本
            </Text>
            <Text style={[styles.previewBody, { fontSize: scaledFontSizes.body }]}>
              正文文本。这是一段示例文字，用于展示当前字体大小下的显示效果。您可以通过上方的滑块调整字体大小，所有应用内的文本都会相应调整。
            </Text>
            <Text style={[styles.previewCaption, { fontSize: scaledFontSizes.caption, color: colors.secondaryText }]}>
              说明文字、注释等小字体文本
            </Text>
          </View>
        </SettingBlock>

        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.primary }]}
          onPress={handleReset}
        >
          <Text style={styles.resetButtonText}>重置为默认大小</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    padding: 20,
  },
  previewHeader: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  previewSubheader: {
    fontWeight: '600',
    marginBottom: 10,
  },
  previewBody: {
    marginBottom: 10,
    lineHeight: 22,
  },
  previewCaption: {
    lineHeight: 18,
  },
  resetButton: {
    marginHorizontal: 16,
    marginVertical: 30,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 