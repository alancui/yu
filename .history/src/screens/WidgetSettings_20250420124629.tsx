import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Image } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { SettingBlock } from '../components/SettingBlock';
import { RadioOption } from '../components/RadioOption';
import { CheckboxOption } from '../components/CheckboxOption';
import { Text } from '../components/Text';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../stores/settingsStore';

export const WidgetSettings: React.FC = () => {
  const { colors } = useTheme();
  const { 
    widgetSize,
    showRecentConversation,
    showQuickActions,
    showRecordingStatus,
    setWidgetSettings
  } = useSettingsStore();

  const handleSizeSelect = (value: string) => {
    setWidgetSettings({ size: value as 'small' | 'medium' | 'large' });
  };

  const handleToggleOption = (option: string, checked: boolean) => {
    switch (option) {
      case 'recent':
        setWidgetSettings({ showRecentConversation: checked });
        break;
      case 'actions':
        setWidgetSettings({ showQuickActions: checked });
        break;
      case 'status':
        setWidgetSettings({ showRecordingStatus: checked });
        break;
    }
  };

  // 模拟预览图片
  const getPreviewImage = () => {
    if (colors.dark) {
      // 深色模式预览
      switch (widgetSize) {
        case 'small': return require('../assets/widget_small_dark.png');
        case 'medium': return require('../assets/widget_medium_dark.png');
        case 'large': return require('../assets/widget_large_dark.png');
      }
    } else {
      // 浅色模式预览
      switch (widgetSize) {
        case 'small': return require('../assets/widget_small_light.png');
        case 'medium': return require('../assets/widget_medium_light.png');
        case 'large': return require('../assets/widget_large_light.png');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderBar title="Widget 配置" />
      
      <ScrollView style={styles.container}>
        <SettingBlock 
          title="Widget 显示内容" 
          description="选择锁屏 Widget 上显示的内容元素"
        >
          <CheckboxOption
            value="recent"
            label="显示最近对话"
            description="在 Widget 上显示最近的对话内容"
            isChecked={showRecentConversation}
            onToggle={handleToggleOption}
          />
          <CheckboxOption
            value="actions"
            label="显示快捷操作按钮"
            description="显示快速操作的按钮"
            isChecked={showQuickActions}
            onToggle={handleToggleOption}
          />
          <CheckboxOption
            value="status"
            label="显示语音识别状态"
            description="显示当前的语音识别状态指示器"
            isChecked={showRecordingStatus}
            onToggle={handleToggleOption}
          />
        </SettingBlock>

        <SettingBlock 
          title="Widget 大小选择" 
          description="选择锁屏上 Widget 的展示尺寸"
        >
          <RadioOption
            value="small"
            label="小号"
            description="最小尺寸，仅显示核心功能"
            isSelected={widgetSize === 'small'}
            onSelect={handleSizeSelect}
          />
          <RadioOption
            value="medium"
            label="中号"
            description="中等尺寸，显示更多内容"
            isSelected={widgetSize === 'medium'}
            onSelect={handleSizeSelect}
          />
          <RadioOption
            value="large"
            label="大号"
            description="最大尺寸，显示全部内容"
            isSelected={widgetSize === 'large'}
            onSelect={handleSizeSelect}
          />
        </SettingBlock>

        <SettingBlock title="预览">
          <View style={styles.previewContainer}>
            <Text style={[styles.previewTitle, { color: colors.secondaryText }]}>
              锁屏效果预览
            </Text>
            <View style={[styles.previewImageContainer, { backgroundColor: colors.isDark ? '#000' : '#f2f2f7' }]}>
              {/* <Image source={getPreviewImage()} style={styles.previewImage} /> */}
              {/* 注意：实际使用时需要替换为真实的预览图片 */}
              <View style={[styles.mockWidget, getWidgetStyle(widgetSize)]}>
                <View style={styles.mockRecordButton} />
                {(widgetSize === 'medium' || widgetSize === 'large') && showRecentConversation && (
                  <View style={styles.mockConversation} />
                )}
                {widgetSize === 'large' && showQuickActions && (
                  <View style={styles.mockActions} />
                )}
              </View>
            </View>
            <Text style={[styles.previewNote, { color: colors.secondaryText }]}>
              注意：需要在iOS设置中添加并启用Widget才能在锁屏显示
            </Text>
          </View>
        </SettingBlock>
      </ScrollView>
    </SafeAreaView>
  );
};

// 获取不同尺寸Widget的样式
const getWidgetStyle = (size: string) => {
  switch (size) {
    case 'small':
      return {
        width: 150,
        height: 150,
      };
    case 'medium':
      return {
        width: 320,
        height: 150,
      };
    case 'large':
      return {
        width: 320,
        height: 320,
      };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    padding: 20,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  previewImageContainer: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  previewNote: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  mockWidget: {
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  mockRecordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    marginBottom: 10,
  },
  mockConversation: {
    width: '90%',
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    marginBottom: 10,
  },
  mockActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
  },
}); 