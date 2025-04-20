import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';

interface UseRecordingResult {
  recording: Audio.Recording | null;
  isRecording: boolean;
  volume: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  error: string | null;
}

export const useRecording = (): UseRecordingResult => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // 请求音频录制权限
  useEffect(() => {
    const getPermissions = async () => {
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          setError('未获得麦克风使用权限');
        }
      } catch (err) {
        setError('获取权限时出错');
        console.error('Error requesting permissions:', err);
      }
    };
    
    getPermissions();
  }, []);
  
  // 设置音频模式
  useEffect(() => {
    const setAudioMode = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch (err) {
        setError('设置音频模式时出错');
        console.error('Error setting audio mode:', err);
      }
    };
    
    setAudioMode();
  }, []);
  
  // 开始录音
  const startRecording = async () => {
    try {
      setError(null);
      // 确保之前的录音已停止
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
      
      // 准备新的录音
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          // 监听录音状态，包括音量
          if (status.metering !== undefined) {
            // 音量值通常在 -160 到 0 之间，我们将其映射到 0-1 范围
            const mappedVolume = Math.max(0, (status.metering + 160) / 160);
            setVolume(mappedVolume);
          }
        },
        100 // 每100ms更新一次
      );
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      setError('开始录音时出错');
      console.error('Error starting recording:', err);
    }
  };
  
  // 停止录音
  const stopRecording = async (): Promise<string> => {
    try {
      if (!recording) {
        throw new Error('没有正在进行的录音');
      }
      
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setVolume(0);
      
      if (!uri) {
        throw new Error('录音URI不可用');
      }
      
      return uri;
    } catch (err) {
      setError('停止录音时出错');
      console.error('Error stopping recording:', err);
      return '';
    }
  };
  
  return {
    recording,
    isRecording,
    volume,
    startRecording,
    stopRecording,
    error,
  };
}; 