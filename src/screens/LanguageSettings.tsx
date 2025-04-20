import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { SettingBlock } from '../components/SettingBlock';
import { RadioOption } from '../components/RadioOption';
import { Text } from '../components/Text';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../stores/settingsStore';

type LanguageSection = 'dialogue' | 'recognition' | 'interface';

export const LanguageSettings: React.FC = () => {
  const { colors } = useTheme();
  const { 
    dialogueLanguage,
    recognitionLanguage,
    interfaceLanguage,
    setLanguageSettings
  } = useSettingsStore();

  const [activeSection, setActiveSection] = useState<LanguageSection>('dialogue');

  const handleLanguageSelect = (section: LanguageSection, value: string) => {
    switch (section) {
      case 'dialogue':
        setLanguageSettings({ dialogue: value as 'zh' | 'en' | 'ja' });
        break;
      case 'recognition':
        setLanguageSettings({ recognition: value as 'zh' | 'en' | 'ja' });
        break;
      case 'interface':
        setLanguageSettings({ interface: value as 'zh' | 'en' | 'ja' });
        break;
    }
  };

  const getLanguageName = (code: string): string => {
    switch (code) {
      case 'zh': return '简体中文';
      case 'en': return '英文';
      case 'ja': return '日文';
      default: return code;
    }
  };

  const renderLanguageOptions = (section: LanguageSection) => {
    const currentValue = 
      section === 'dialogue' ? dialogueLanguage :
      section === 'recognition' ? recognitionLanguage : interfaceLanguage;
    
    return (
      <>
        <RadioOption
          value="zh"
          label="简体中文"
          isSelected={currentValue === 'zh'}
          onSelect={(value) => handleLanguageSelect(section, value)}
        />
        <RadioOption
          value="en"
          label="英文"
          isSelected={currentValue === 'en'}
          onSelect={(value) => handleLanguageSelect(section, value)}
        />
        <RadioOption
          value="ja"
          label="日文"
          isSelected={currentValue === 'ja'}
          onSelect={(value) => handleLanguageSelect(section, value)}
        />
      </>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderBar title="语言设置" />
      
      <ScrollView style={styles.container}>
        <SettingBlock 
          title="默认对话语言"
          description="设置与AI对话时使用的默认语言，影响AI回复的语言"
        >
          {renderLanguageOptions('dialogue')}
        </SettingBlock>

        <SettingBlock 
          title="语音识别语言"
          description="设置语音识别时使用的语言模型，影响识别准确率"
        >
          {renderLanguageOptions('recognition')}
        </SettingBlock>

        <SettingBlock 
          title="界面语言"
          description="设置应用界面显示的语言，影响所有UI元素的文本"
        >
          {renderLanguageOptions('interface')}
        </SettingBlock>

        <View style={styles.noteContainer}>
          <Text style={[styles.noteText, { color: colors.secondaryText }]}>
            注意：修改界面语言后，需要重启应用才能完全生效。
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
  noteContainer: {
    padding: 20,
    marginBottom: 30,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
}); 