import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
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
import { AppHeader } from '../components/AppHeader';

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
      <AppHeader currentMode="voice" />
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