import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Text } from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';

type SettingItemProps = {
  title: string;
  value?: string;
  onPress?: () => void;
  switch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
};

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  value,
  onPress,
  switch: isSwitch,
  switchValue,
  onSwitchChange,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !isSwitch}
    >
      <Text style={styles.itemTitle}>{title}</Text>
      {value && <Text style={[styles.itemValue, { color: colors.secondaryText }]}>{value}</Text>}
      {isSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      )}
    </TouchableOpacity>
  );
};

type SettingSectionProps = {
  title: string;
  children: React.ReactNode;
};

const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
        {children}
      </View>
    </View>
  );
};

export const SettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [defaultMode, setDefaultMode] = useState('语音');
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [defaultDialogueLanguage, setDefaultDialogueLanguage] = useState('中文');
  const [voiceRecognitionLanguage, setVoiceRecognitionLanguage] = useState('中文');
  const [interfaceLanguage, setInterfaceLanguage] = useState('中文');

  const handleDefaultModeChange = () => {
    Alert.alert(
      '选择默认交互模式',
      '请选择默认启动应用时的交互模式',
      [
        { text: '语音模式', onPress: () => setDefaultMode('语音') },
        { text: '文字模式', onPress: () => setDefaultMode('文字') },
        { text: '取消', style: 'cancel' }
      ]
    );
  };

  const handleDefaultDialogueLanguageChange = () => {
    Alert.alert(
      '选择默认对话语言',
      '请选择与AI助手对话时的默认语言',
      [
        { text: '中文', onPress: () => setDefaultDialogueLanguage('中文') },
        { text: '英文', onPress: () => setDefaultDialogueLanguage('英文') },
        { text: '日文', onPress: () => setDefaultDialogueLanguage('日文') },
        { text: '取消', style: 'cancel' }
      ]
    );
  };

  const handleVoiceRecognitionLanguageChange = () => {
    Alert.alert(
      '选择语音识别语言',
      '请选择语音识别时使用的语言',
      [
        { text: '中文', onPress: () => setVoiceRecognitionLanguage('中文') },
        { text: '英文', onPress: () => setVoiceRecognitionLanguage('英文') },
        { text: '日文', onPress: () => setVoiceRecognitionLanguage('日文') },
        { text: '取消', style: 'cancel' }
      ]
    );
  };

  const handleInterfaceLanguageChange = () => {
    Alert.alert(
      '选择界面语言',
      '请选择应用界面显示的语言',
      [
        { text: '中文', onPress: () => setInterfaceLanguage('中文') },
        { text: '英文', onPress: () => setInterfaceLanguage('英文') },
        { text: '取消', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SettingSection title="交互偏好设置">
          <SettingItem
            title="默认交互模式"
            value={defaultMode}
            onPress={handleDefaultModeChange}
          />
          <SettingItem
            title="自动播放语音"
            switch
            switchValue={autoPlayVoice}
            onSwitchChange={setAutoPlayVoice}
          />
          <SettingItem
            title="语音识别设置"
            onPress={() => {}}
          />
        </SettingSection>

        <SettingSection title="语言设置">
          <SettingItem
            title="默认对话语言"
            value={defaultDialogueLanguage}
            onPress={handleDefaultDialogueLanguageChange}
          />
          <SettingItem
            title="语音识别语言"
            value={voiceRecognitionLanguage}
            onPress={handleVoiceRecognitionLanguageChange}
          />
          <SettingItem
            title="界面语言"
            value={interfaceLanguage}
            onPress={handleInterfaceLanguageChange}
          />
        </SettingSection>

        <SettingSection title="Triage 设置">
          <SettingItem
            title="Prompt 编辑器"
            onPress={() => {}}
          />
          <SettingItem
            title="目标系统设置"
            onPress={() => {}}
          />
          <SettingItem
            title="历史目标系统操作记录"
            onPress={() => {}}
          />
        </SettingSection>

        <SettingSection title="界面设置">
          <SettingItem
            title="深色模式"
            switch
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />
          <SettingItem
            title="字体大小"
            value="中"
            onPress={() => {}}
          />
          <SettingItem
            title="Widget 配置"
            onPress={() => {}}
          />
        </SettingSection>

        <SettingSection title="关于">
          <SettingItem
            title="版本"
            value="1.0.0"
          />
          <SettingItem
            title="隐私政策"
            onPress={() => {}}
          />
          <SettingItem
            title="用户协议"
            onPress={() => {}}
          />
        </SettingSection>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 16,
    marginTop: 8,
  },
  sectionContent: {
    borderRadius: 10,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemTitle: {
    flex: 1,
    fontSize: 17,
  },
  itemValue: {
    marginLeft: 8,
    fontSize: 17,
  },
}); 