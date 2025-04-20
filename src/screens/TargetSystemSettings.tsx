import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { SettingBlock } from '../components/SettingBlock';
import { CheckboxOption } from '../components/CheckboxOption';
import { Text } from '../components/Text';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type SystemType = 'reminders' | 'calendar' | 'notes' | 'custom';

type TargetSystem = {
  id: SystemType;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
};

export const TargetSystemSettings: React.FC = () => {
  const { colors } = useTheme();
  const [systems, setSystems] = useState<TargetSystem[]>([
    { id: 'reminders', name: 'Reminders 任务管理', description: '创建和管理iOS提醒事项', enabled: true, priority: 1 },
    { id: 'calendar', name: 'Calendar 日历', description: '添加和管理iOS日历事件', enabled: true, priority: 2 },
    { id: 'notes', name: 'Notes 笔记', description: '创建和编辑iOS笔记', enabled: true, priority: 3 },
    { id: 'custom', name: '自定义系统', description: '添加您自己的集成系统', enabled: false, priority: 4 }
  ]);

  const [autoDetect, setAutoDetect] = useState(true);
  const [confirmBeforeAction, setConfirmBeforeAction] = useState(true);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  const handleSystemToggle = (id: string, enabled: boolean) => {
    setSystems(prev => prev.map(system => 
      system.id === id ? { ...system, enabled } : system
    ));
  };

  const handleMovePriorityUp = (id: string) => {
    setSystems(prev => {
      const newSystems = [...prev];
      const index = newSystems.findIndex(s => s.id === id);
      if (index > 0) {
        // 交换当前系统与上一个系统的优先级
        const temp = newSystems[index].priority;
        newSystems[index].priority = newSystems[index - 1].priority;
        newSystems[index - 1].priority = temp;
      }
      return newSystems.sort((a, b) => a.priority - b.priority);
    });
  };

  const handleMovePriorityDown = (id: string) => {
    setSystems(prev => {
      const newSystems = [...prev];
      const index = newSystems.findIndex(s => s.id === id);
      if (index < newSystems.length - 1) {
        // 交换当前系统与下一个系统的优先级
        const temp = newSystems[index].priority;
        newSystems[index].priority = newSystems[index + 1].priority;
        newSystems[index + 1].priority = temp;
      }
      return newSystems.sort((a, b) => a.priority - b.priority);
    });
  };

  const handleAddCustomSystem = () => {
    Alert.alert(
      '添加自定义系统',
      '这将引导您设置一个新的目标系统集成。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '继续', 
          onPress: () => {
            // 这里应该导航到自定义系统创建页面
            Alert.alert('功能提示', '自定义系统集成功能正在开发中');
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderBar title="目标系统设置" />
      
      <ScrollView style={styles.container}>
        <SettingBlock 
          title="启用的目标系统" 
          description="选择AI助手可以与哪些系统集成"
        >
          {systems.map((system) => (
            <CheckboxOption
              key={system.id}
              value={system.id}
              label={system.name}
              description={system.description}
              isChecked={system.enabled}
              onToggle={handleSystemToggle}
            />
          ))}
          
          <TouchableOpacity 
            style={[styles.addButton, { borderColor: colors.primary }]}
            onPress={handleAddCustomSystem}
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            <Text style={[styles.addButtonText, { color: colors.primary }]}>
              添加新的系统集成
            </Text>
          </TouchableOpacity>
        </SettingBlock>

        <SettingBlock 
          title="系统集成优先级" 
          description="设置多个系统能够处理同一请求时的优先顺序"
        >
          <View style={styles.priorityContainer}>
            {systems
              .filter(system => system.enabled)
              .sort((a, b) => a.priority - b.priority)
              .map((system, index, array) => (
                <View 
                  key={system.id}
                  style={[
                    styles.priorityItem, 
                    { 
                      backgroundColor: selectedSystemId === system.id 
                        ? colors.primary + '20' // 半透明的主色调
                        : colors.card 
                    }
                  ]}
                >
                  <View style={styles.priorityActions}>
                    {index > 0 && (
                      <TouchableOpacity 
                        style={styles.priorityButton}
                        onPress={() => handleMovePriorityUp(system.id)}
                      >
                        <Ionicons name="chevron-up" size={22} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                    
                    {index < array.length - 1 && (
                      <TouchableOpacity 
                        style={styles.priorityButton}
                        onPress={() => handleMovePriorityDown(system.id)}
                      >
                        <Ionicons name="chevron-down" size={22} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <View style={styles.priorityContent}>
                    <Text style={styles.priorityLabel}>{system.name}</Text>
                    <Text style={[styles.priorityNumber, { color: colors.secondaryText }]}>
                      优先级: {system.priority}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
          <Text style={[styles.dragHint, { color: colors.secondaryText }]}>
            提示: 使用上下箭头调整系统优先级
          </Text>
        </SettingBlock>

        <SettingBlock 
          title="提示设置" 
          description="控制系统如何识别和处理目标系统相关的操作"
        >
          <CheckboxOption
            value="autoDetect"
            label="自动识别目标系统"
            description="让AI自动确定应使用哪个目标系统"
            isChecked={autoDetect}
            onToggle={(_, checked) => setAutoDetect(checked)}
          />
          <CheckboxOption
            value="confirm"
            label="操作前确认"
            description="在执行系统操作前请求您的确认"
            isChecked={confirmBeforeAction}
            onToggle={(_, checked) => setConfirmBeforeAction(checked)}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  addButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  priorityContainer: {
    paddingVertical: 10,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
  },
  priorityActions: {
    justifyContent: 'center',
    padding: 8,
  },
  priorityButton: {
    padding: 4,
  },
  priorityContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  priorityNumber: {
    fontSize: 13,
    marginTop: 4,
  },
  dragHint: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
}); 