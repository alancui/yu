/**
 * 语音转文字服务
 * 这个服务负责将录音文件发送到云端API进行语音识别
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// TODO: 添加实际的API_KEY和API_ENDPOINT - 这些应该从环境变量获取
const API_KEY = process.env.OPENAI_API_KEY || '';
const API_ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions';

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
      if (FileSystem.FileSystem) {
        const base64data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64
        });
        return base64data;
      } else {
        throw new Error('FileSystem不可用');
      }
    }
  } catch (error) {
    console.error('转换音频为Base64失败:', error);
    throw new Error('无法处理音频文件');
  }
}

/**
 * 创建FormData对象（适用于OpenAI API）
 */
async function createFormData(audioUri: string, language: string): Promise<FormData> {
  // 识别文件类型，从URI中提取
  const fileType = audioUri.endsWith('.m4a') ? 'audio/m4a' : 
                  audioUri.endsWith('.mp3') ? 'audio/mp3' : 
                  audioUri.endsWith('.wav') ? 'audio/wav' : 
                  'audio/m4a'; // 默认类型

  // 从完整路径中提取文件名
  const fileName = audioUri.split('/').pop() || `audio_${Date.now()}.m4a`;
  
  // 创建FormData
  const formData = new FormData();
  
  // 添加音频文件
  formData.append('file', {
    uri: audioUri,
    type: fileType,
    name: fileName,
  } as any);
  
  // 添加模型参数 - 使用OpenAI的Whisper模型
  formData.append('model', 'whisper-1');
  
  // 添加语言参数
  if (language) {
    formData.append('language', language);
  }
  
  // 添加其他选项
  formData.append('response_format', 'json');
  
  return formData;
}

/**
 * 将语音转换为文字 (使用OpenAI的Whisper API)
 * @param audioUri 音频文件的URI
 * @param language 语言代码 (如 'zh', 'en')
 */
export async function convertSpeechToText(
  audioUri: string,
  language: string = 'zh'
): Promise<SpeechToTextResult> {
  try {
    // 准备FormData
    const formData = await createFormData(audioUri, language);
    
    // 调用OpenAI的Whisper API
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        // 注意：使用FormData时不要设置Content-Type，浏览器会自动设置正确的边界
      },
      body: formData
    });
    
    // 处理响应
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API错误 (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    
    // 从OpenAI API返回中解析结果
    return {
      text: result.text || '',
      confidence: 0.9, // OpenAI API不返回置信度，这里给个默认值
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