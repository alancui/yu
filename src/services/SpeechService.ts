/**
 * 语音转文字服务
 * 这个服务负责将录音文件发送到云端API进行语音识别
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { transcriptionService } from './transcriptionService';
import { serviceProvider } from './ServiceProvider';

interface SpeechToTextResult {
  text: string;
  confidence: number;
  language?: string;
  error?: string;
}

/**
 * 将音频数据转换为Base64字符串
 */
async function audioToBase64(uri: string): Promise<string> {
  try {
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data.split(',')[1] || '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // 在移动端使用expo-file-system
      try {
        const base64data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64
        });
        return base64data;
      } catch (fsError) {
        console.error('FileSystem错误:', fsError);
        throw new Error('无法读取音频文件');
      }
    }
  } catch (error) {
    console.error('转换音频为Base64失败:', error);
    throw new Error('无法处理音频文件');
  }
}

/**
 * 将文件转换为ArrayBuffer
 */
async function fileToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  try {
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      return await response.arrayBuffer();
    } else {
      // 在移动端使用expo-file-system
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // 将Base64转换为ArrayBuffer
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
  } catch (error) {
    console.error('转换文件为ArrayBuffer失败:', error);
    throw new Error('无法处理音频文件');
  }
}

/**
 * 从URI获取文件类型
 */
function getFileType(uri: string): string {
  return uri.endsWith('.m4a') ? 'audio/m4a' : 
         uri.endsWith('.mp3') ? 'audio/mp3' : 
         uri.endsWith('.wav') ? 'audio/wav' : 
         'audio/m4a'; // 默认类型
}

/**
 * 将语音转换为文字 (使用transcriptionService)
 * @param audioUri 音频文件的URI
 * @param language 语言代码 (如 'zh', 'en')
 */
export async function convertSpeechToText(
  audioUri: string,
  language: string = 'zh'
): Promise<SpeechToTextResult> {
  try {
    // 获取API客户端
    const apiClient = serviceProvider.getApiClient();
    
    // 获取文件类型和采样率
    const fileType = getFileType(audioUri);
    const sampleRate = 16000; // 假设采样率为16kHz，可根据实际情况调整
    
    // 开始语音处理
    const { transcriptionId, sseEndpoint } = await apiClient.startSpeechProcessing({
      format: fileType,
      sampleRate
    });
    
    // 创建转录会话
    const session = transcriptionService.getSession(transcriptionId) || 
                   await transcriptionService.startSpeechProcessing({
                     format: fileType,
                     sampleRate
                   });
    
    // 读取音频文件并转换为ArrayBuffer
    const audioData = await fileToArrayBuffer(audioUri);
    
    // 发送音频数据
    await apiClient.sendAudioChunk(transcriptionId, audioData);
    
    // 结束语音处理并获取结果
    const result = await apiClient.endSpeechProcessing(transcriptionId);
    
    // 返回结果
    return {
      text: result.transcription || '',
      confidence: 0.9, // 默认置信度，服务端可能提供更准确的值
      language
    };
  } catch (error) {
    console.error('语音转文字错误:', error);
    return {
      text: '',
      confidence: 0,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
} 