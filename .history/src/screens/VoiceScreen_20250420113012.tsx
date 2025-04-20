import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from '../components/StatusBar';
import { RecordButton } from '../components/RecordButton';
import { useTheme } from '../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { useRecording } from '../hooks/useRecording';
import { Text } from '../components/Text';

const { width, height } = Dimensions.get('window');
const buttonSize = Math.min(width, height) * 0.25; // 按钮大小为屏幕较小边的 25%

type VoiceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Voice'>;

export const VoiceScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<VoiceScreenNavigationProp>();
  const { 
    isRecording, 
    volume, 
    startRecording, 
    stopRecording,
    error
  } = useRecording();

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      Alert.alert('录音错误', '无法开始录音。请检查麦克风权限。');
      console.error('录音错误:', err);
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioUri = await stopRecording();
      if (audioUri) {
        console.log('录音文件地址:', audioUri);
        // TODO: 处理录音文件，发送到语音识别服务
      }
    } catch (err) {
      Alert.alert('录音错误', '停止录音时出现问题。');
      console.error('停止录音错误:', err);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar />
      <View style={styles.content}>
        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        ) : null}
        <RecordButton
          isRecording={isRecording}
          volume={volume}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
        {isRecording && (
          <Text style={[styles.recordingText, { color: colors.primary }]}>
            正在录音...
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.modeSwitch, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('Text')}
      >
        <Ionicons name="keypad-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSwitch: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorText: {
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  recordingText: {
    marginTop: 20,
    fontSize: 16,
  },
}); 