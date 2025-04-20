import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { VoiceButton } from '../components/VoiceButton';
import { useTheme } from '../theme';

export const VoiceScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);

  // TODO: 实现实际的录音功能和音量检测
  const handleStartRecording = () => {
    setIsRecording(true);
    // 模拟音量变化
    const interval = setInterval(() => {
      setVolume(Math.random());
    }, 100);
    return () => clearInterval(interval);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setVolume(0);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 状态栏 */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.statusIndicator} />
      </View>

      {/* 录音按钮 */}
      <View style={styles.buttonContainer}>
        <VoiceButton
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          volume={volume}
        />
      </View>

      {/* 切换到文字界面的按钮 */}
      <TouchableOpacity
        style={[styles.switchButton, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('Text')}
      >
        <Ionicons name="keyboard-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchButton: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 