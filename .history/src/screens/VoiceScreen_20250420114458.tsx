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

const VoiceScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { stopRecording } = useRecording();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);

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

  return (
    <View style={styles.container}>
      <StatusBar />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.modeSwitch, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Text', {})}
          >
            <Ionicons name="keypad-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>语音识别</Text>
          <Text style={styles.subtitle}>请开始说话</Text>
          <RecordButton onStopRecording={handleStopRecording} />
          {isTranscribing && (
            <ActivityIndicator size="large" color={colors.primary} />
          )}
          {error && (
            <Text style={styles.error}>{error}</Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  modeSwitch: {
    padding: 10,
    borderRadius: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginTop: 20,
  },
});

export default VoiceScreen; 