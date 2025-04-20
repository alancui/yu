import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { Text } from './Text';
import { RootStackParamList } from '../types';

type StatusBarNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  showModeSwitch?: boolean;
  connected?: boolean;
};

export const StatusBar: React.FC<Props> = ({ 
  showModeSwitch = false,
  connected = true,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation<StatusBarNavigationProp>();

  const handleChatIconPress = () => {
    // 在文字模式下，点击对话图标可以查看对话历史或开始新对话
    Alert.alert(
      '对话选项',
      '请选择操作',
      [
        { text: '查看历史对话', onPress: () => console.log('查看历史对话') },
        { text: '开始新对话', onPress: () => console.log('开始新对话') },
        { text: '取消', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.statusContainer}>
        <View style={styles.connectionStatus}>
          <View style={[
            styles.dot, 
            { backgroundColor: connected ? '#4CAF50' : '#F44336' }
          ]} />
          <Text style={[styles.statusText, { color: colors.secondaryText }]}>
            {connected ? '已连接' : '未连接'}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        {showModeSwitch && (
          <TouchableOpacity 
            style={styles.button}
            onPress={handleChatIconPress}
          >
            <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statusContainer: {
    flex: 1,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 8,
    marginLeft: 8,
  },
}); 