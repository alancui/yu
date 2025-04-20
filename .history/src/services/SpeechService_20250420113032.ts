/**
 * 语音转文字服务
 * 这个服务负责将录音文件发送到云端API进行语音识别
 */

import { Platform } from 'react-native';

// TODO: 添加实际的API_KEY和API_ENDPOINT
const API_KEY = process.env.SPEECH_API_KEY || '';
const API_ENDPOINT = process.env.SPEECH_API_ENDPOINT || 'https://api.example.com/speech-to-text';

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
    // 在实际实现中，需要根据平台使用不同的方法读取文件
    // 这里只是一个简单的占位实现
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
      // 在移动端使用适当的文件读取方法
      // 这需要使用额外的原生库如expo-file-system
      console.warn('需要实现实际的文件读取逻辑');
      return '';
    }
  } catch (error) {
    console.error('转换音频为Base64失败:', error);
    throw new Error('无法处理音频文件');
  }
}

/**
 * 将语音转换为文字
 * @param audioUri 音频文件的URI
 * @param language 语言代码 (如 'zh-CN', 'en-US')
 */
export async function convertSpeechToText(
  audioUri: string,
  language: string = 'zh-CN'
): Promise<SpeechToTextResult> {
  try {
    // 1. 将音频文件转换为Base64
    const audioBase64 = await audioToBase64(audioUri);
    
    // 2. 准备请求数据
    const requestData = {
      audio: {
        content: audioBase64
      },
      config: {
        languageCode: language,
        enableAutomaticPunctuation: true,
      }
    };
    
    // 3. 调用API
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestData)
    });
    
    // 4. 处理响应
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API错误 (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    
    // 5. 解析结果 (注意：这里的结构需要根据实际使用的API来调整)
    return {
      text: result.results?.[0]?.alternatives?.[0]?.transcript || '',
      confidence: result.results?.[0]?.alternatives?.[0]?.confidence || 0,
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