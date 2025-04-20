import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
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
import { convertSpeechToText } from '../services/SpeechService';

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
    error: recordingError
  } = useRecording();
  
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartRecording = async () => {
    try {
      setTranscribedText('');
      setError(null);
      await startRecording();
    } catch (err) {
      setError('无法开始录音。请检查麦克风权限。');
      console.error('录音错误:', err);
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioUri = await stopRecording();
      if (audioUri) {
        console.log('录音文件地址:', audioUri);
        
        // 开始转写
        setIsTranscribing(true);
        
        try {
          const result = await convertSpeechToText(audioUri);
          
          if (result.error) {
            setError(`语音识别出错: ${result.error}`);
          } else if (!result.text) {
            setError('未能识别语音内容');
          } else {
            setTranscribedText(result.text);
            
            // 导航到文本界面并将转写结果传递过去
            // 这里需要修改导航参数类型，添加可选的initialText参数
            navigation.navigate('Text', { initialText: result.text });
          }
        } catch (transcriptionError) {
          setError('语音转文字服务出错');
          console.error('转写错误:', transcriptionError);
        } finally {
          setIsTranscribing(false);
        }
      }
    } catch (err) {
      setError('停止录音时出现问题。');
      console.error('停止录音错误:', err);
    }
  };

  const displayError = error || recordingError;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar />
      <View style={styles.content}>
        {displayError ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {displayError}
          </Text>
        ) : null}
        
        {isTranscribing ? (
          <View style={styles.transcribingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.transcribingText, { color: colors.text }]}>
              正在识别语音...
            </Text>
          </View>
        ) : (
          <RecordButton
            isRecording={isRecording}
            volume={volume}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
        )}
        
        {isRecording && (
          <Text style={[styles.recordingText, { color: colors.primary }]}>
            正在录音...
          </Text>
        )}
        
        {transcribedText ? (
          <View style={[styles.resultContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.resultText, { color: colors.text }]}>
              {transcribedText}
            </Text>
          </View>
        ) : null}
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
    paddingHorizontal: 20,
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
  transcribingContainer: {
    alignItems: 'center',
  },
  transcribingText: {
    marginTop: 10,
    fontSize: 16,
  },
  resultContainer: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    maxHeight: 150,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
  },
}); 