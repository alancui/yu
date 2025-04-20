import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { SettingBlock } from '../components/SettingBlock';
import { RadioOption } from '../components/RadioOption';
import { Text } from '../components/Text';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type ScenarioType = 'general' | 'work' | 'study' | 'custom1' | 'custom2';

type PromptTemplate = {
  id: string;
  name: string;
  description: string;
  content: string;
};

export const PromptEditor: React.FC = () => {
  const { colors } = useTheme();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('general');
  const [promptText, setPromptText] = useState<string>(defaultPrompts[selectedScenario]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');

  const handleScenarioChange = (scenario: ScenarioType) => {
    if (promptText !== defaultPrompts[selectedScenario]) {
      Alert.alert(
        '确认切换场景',
        '当前场景的Prompt已经修改，切换场景将丢失未保存的修改，是否继续？',
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '继续', 
            onPress: () => {
              setSelectedScenario(scenario);
              setPromptText(defaultPrompts[scenario]);
            } 
          }
        ]
      );
    } else {
      setSelectedScenario(scenario);
      setPromptText(defaultPrompts[scenario]);
    }
  };

  const handleResetPrompt = () => {
    Alert.alert(
      '确认重置',
      '确定要重置当前的Prompt内容吗？这将恢复到默认设置。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '重置', 
          style: 'destructive',
          onPress: () => setPromptText(defaultPrompts[selectedScenario]) 
        }
      ]
    );
  };

  const handleSavePrompt = () => {
    // 这里应该实现保存逻辑，例如将prompt存储到AsyncStorage或状态管理
    Alert.alert('保存成功', '当前Prompt已成功保存');
    // 实际应用中，应该更新保存状态，例如：
    // savePrompt(selectedScenario, promptText);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = promptTemplates.find(t => t.id === templateId);
    if (template) {
      Alert.alert(
        '应用模板',
        `确定要应用"${template.name}"模板吗？当前内容将被替换。`,
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '应用', 
            onPress: () => setPromptText(template.content) 
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderBar 
        title="Prompt 编辑器" 
        rightComponent={
          <TouchableOpacity onPress={handleSavePrompt}>
            <Text style={{ color: colors.primary }}>保存</Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.container}>
        <SettingBlock title="选择场景">
          <View style={styles.pickerContainer}>
            <TouchableOpacity 
              style={[
                styles.scenarioButton, 
                selectedScenario === 'general' && { backgroundColor: colors.primary }
              ]}
              onPress={() => handleScenarioChange('general')}
            >
              <Text style={[
                styles.scenarioText, 
                selectedScenario === 'general' && { color: 'white' }
              ]}>
                通用对话
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.scenarioButton, 
                selectedScenario === 'work' && { backgroundColor: colors.primary }
              ]}
              onPress={() => handleScenarioChange('work')}
            >
              <Text style={[
                styles.scenarioText, 
                selectedScenario === 'work' && { color: 'white' }
              ]}>
                工作助手
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.scenarioButton, 
                selectedScenario === 'study' && { backgroundColor: colors.primary }
              ]}
              onPress={() => handleScenarioChange('study')}
            >
              <Text style={[
                styles.scenarioText, 
                selectedScenario === 'study' && { color: 'white' }
              ]}>
                学习助手
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.scenarioButton, 
                selectedScenario === 'custom1' && { backgroundColor: colors.primary }
              ]}
              onPress={() => handleScenarioChange('custom1')}
            >
              <Text style={[
                styles.scenarioText, 
                selectedScenario === 'custom1' && { color: 'white' }
              ]}>
                自定义1
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.scenarioButton, 
                selectedScenario === 'custom2' && { backgroundColor: colors.primary }
              ]}
              onPress={() => handleScenarioChange('custom2')}
            >
              <Text style={[
                styles.scenarioText, 
                selectedScenario === 'custom2' && { color: 'white' }
              ]}>
                自定义2
              </Text>
            </TouchableOpacity>
          </View>
        </SettingBlock>

        <SettingBlock title="编辑Prompt" description="自定义AI助手的提示词，影响AI回答的风格和内容">
          <TextInput
            style={[
              styles.promptInput,
              { 
                color: colors.text,
                backgroundColor: colors.inputBackground,
                borderColor: colors.border
              }
            ]}
            value={promptText}
            onChangeText={setPromptText}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="输入自定义Prompt..."
            placeholderTextColor={colors.secondaryText}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, { borderColor: colors.error }]}
              onPress={handleResetPrompt}
            >
              <Ionicons name="refresh" size={18} color={colors.error} />
              <Text style={[styles.buttonText, { color: colors.error }]}>重置</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSavePrompt}
            >
              <Ionicons name="save" size={18} color="white" />
              <Text style={[styles.buttonText, { color: 'white' }]}>保存</Text>
            </TouchableOpacity>
          </View>
        </SettingBlock>

        <SettingBlock title="预设模板" description="选择预设的Prompt模板，快速应用常用设置">
          {promptTemplates.map(template => (
            <RadioOption
              key={template.id}
              value={template.id}
              label={template.name}
              description={template.description}
              isSelected={selectedTemplate === template.id}
              onSelect={(value) => {
                setSelectedTemplate(value);
                handleTemplateSelect(value);
              }}
            />
          ))}
        </SettingBlock>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  scenarioButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  scenarioText: {
    fontSize: 14,
    fontWeight: '500',
  },
  promptInput: {
    minHeight: 200,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
  },
});

// 默认的Prompt
const defaultPrompts: Record<ScenarioType, string> = {
  general: `你是一位友好、专业的AI助手。
- 提供准确、客观的回答
- 在不确定时表明信息的局限性
- 使用清晰简洁的语言表达
- 根据上下文适当调整回答的详尽程度`,
  
  work: `你是一位高效的工作助手。
- 优先考虑提高工作效率的解决方案
- 回答应简明扼要，直击要点
- 在可能的情况下，提供步骤化的行动建议
- 专注于具体、可行的建议而非理论讨论`,
  
  study: `你是一位耐心的学习导师。
- 解释概念时使用浅显易懂的语言
- 提供具体例子帮助理解复杂概念
- 鼓励批判性思考和深入学习
- 适当提出引导性问题以促进思考`,
  
  custom1: `[在此输入自定义Prompt]`,
  
  custom2: `[在此输入自定义Prompt]`
};

// 预设模板
const promptTemplates: PromptTemplate[] = [
  {
    id: 'default',
    name: '默认模板',
    description: '平衡的回答风格，适合大多数场景',
    content: defaultPrompts.general
  },
  {
    id: 'efficiency',
    name: '效率优先模板',
    description: '简短直接的回答，聚焦关键信息',
    content: `你是一位高效的AI助手。
- 始终以最简洁的方式回答问题
- 优先提供关键信息和直接解决方案
- 避免不必要的解释和背景信息
- 使用要点和列表提高可读性`
  },
  {
    id: 'detailed',
    name: '详细解析模板',
    description: '提供深入细致的分析和解释',
    content: `你是一位深入分析的AI助手。
- 提供全面、详尽的回答
- 解释基本概念和深层原理
- 引用相关知识和上下文
- 考虑问题的不同维度和可能的例外情况`
  },
  {
    id: 'creative',
    name: '创意思考模板',
    description: '鼓励创新和多角度思考',
    content: `你是一位创意型AI助手。
- 提供多角度、创新性的观点
- 鼓励跳出固有思维模式
- 结合不同领域的知识提供独特视角
- 帮助拓展思路和激发灵感`
  }
]; 