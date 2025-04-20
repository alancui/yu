import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { Text } from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
  isFirst?: boolean;
};

const SettingSection: React.FC<SettingSectionProps> = ({ title, children, isFirst = false }) => {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.section, 
      isFirst ? { marginTop: 0 } : null
    ]}>
      <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
        {children}
      </View>
    </View>
  );
};

export const SettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const navigateToHistoryRecords = () => {
    navigation.navigate('HistoryRecord');
  };

  const navigateToPromptEditor = () => {
    navigation.navigate('PromptEditor');
  };

  const navigateToTargetSystemSettings = () => {
    navigation.navigate('TargetSystemSettings');
  };
  
  const navigateToVoicePlaybackSettings = () => {
    navigation.navigate('VoicePlaybackSettings');
  };
  
  const navigateToVoiceRecognitionSettings = () => {
    navigation.navigate('VoiceRecognitionSettings');
  };
  
  const navigateToInteractionModeSettings = () => {
    navigation.navigate('InteractionModeSettings');
  };
  
  const navigateToLanguageSettings = () => {
    navigation.navigate('LanguageSettings');
  };
  
  const navigateToFontSizeSettings = () => {
    navigation.navigate('FontSizeSettings');
  };
  
  const navigateToWidgetSettings = () => {
    navigation.navigate('WidgetSettings');
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container}>
        <SettingSection title="交互偏好设置" isFirst={true}>
          <SettingItem
            title="默认交互模式"
            value="语音"
            onPress={navigateToInteractionModeSettings}
          />
          <SettingItem
            title="语音播放设置"
            onPress={navigateToVoicePlaybackSettings}
          />
          <SettingItem
            title="语音识别设置"
            onPress={navigateToVoiceRecognitionSettings}
          />
        </SettingSection>

        <SettingSection title="语言设置">
          <SettingItem
            title="默认对话语言"
            value="中文"
            onPress={navigateToLanguageSettings}
          />
          <SettingItem
            title="语音识别语言"
            value="中文"
            onPress={navigateToLanguageSettings}
          />
          <SettingItem
            title="界面语言"
            value="中文"
            onPress={navigateToLanguageSettings}
          />
        </SettingSection>

        <SettingSection title="Triage 设置">
          <SettingItem
            title="Prompt 编辑器"
            onPress={navigateToPromptEditor}
          />
          <SettingItem
            title="目标系统设置"
            onPress={navigateToTargetSystemSettings}
          />
          <SettingItem
            title="历史目标系统操作记录"
            onPress={navigateToHistoryRecords}
          />
        </SettingSection>

        <SettingSection title="界面设置">
          <SettingItem
            title="深色模式"
            switch
            switchValue={false}
            onSwitchChange={() => {}}
          />
          <SettingItem
            title="字体大小"
            value="中"
            onPress={navigateToFontSizeSettings}
          />
          <SettingItem
            title="Widget 配置"
            onPress={navigateToWidgetSettings}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 16,
  },
  sectionContent: {
    borderRadius: 10,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
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