import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from '../components/StatusBar';
import { MessageBubble } from '../components/MessageBubble';
import { useTheme } from '../theme/ThemeContext';
import { Message, RootStackParamList } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Text';
import { 
  sendMessageToAI, 
  createUserMessage, 
  updateMessageStatus 
} from '../services/ConversationService';

const { width } = Dimensions.get('window');

type TextScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Text'>;
type TextScreenRouteProp = RouteProp<RootStackParamList, 'Text'>;

export const TextScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<TextScreenNavigationProp>();
  const route = useRoute<TextScreenRouteProp>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // 列表引用，用于自动滚动
  const listRef = useRef<FlatList>(null);

  // 当导航参数中有initialText时，将其设置为输入框内容
  useEffect(() => {
    if (route.params?.initialText) {
      setInputText(route.params.initialText);
    }
  }, [route.params?.initialText]);

  // 当有新消息时自动滚动到底部
  useEffect(() => {
    if (messages.length > 0 && listRef.current) {
      setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    // 创建并添加用户消息
    const userMessage = createUserMessage(inputText.trim());
    setMessages(prev => [userMessage, ...prev]);
    setInputText('');
    setIsSending(true);

    try {
      // 发送消息到AI
      const aiResponse = await sendMessageToAI(userMessage.content);
      
      // 更新用户消息状态为已发送
      setMessages(prev => {
        const updatedMessages = updateMessageStatus(userMessage.id, 'sent', prev);
        // 添加AI响应
        return [aiResponse, ...updatedMessages];
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 更新用户消息状态为错误
      setMessages(prev => 
        updateMessageStatus(userMessage.id, 'error', prev)
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      // 停止录音
      // TODO: 实现文本界面内的语音输入
    } else {
      // 开始录音
      // TODO: 实现文本界面内的语音输入
    }
  };

  const handleTakePhoto = () => {
    // TODO: 实现照片拍摄
    console.log('拍照');
  };

  const handleUploadFile = () => {
    // TODO: 实现文件上传
    console.log('上传文件');
  };

  const switchToVoiceMode = () => {
    navigation.navigate('Voice');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar showModeSwitch={false} />
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          style={styles.messageList}
          inverted
          contentContainerStyle={styles.listContent}
        />
        
        <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input, 
                { 
                  color: colors.text, 
                  backgroundColor: colors.inputBackground 
                }
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="输入消息..."
              placeholderTextColor={colors.secondaryText}
              multiline
              textAlignVertical="top"
            />
            {isSending ? (
              <View style={[styles.sendButton, { backgroundColor: colors.primary }]}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.sendButton, 
                  { 
                    backgroundColor: inputText.trim() ? colors.primary : colors.inputBackground,
                  }
                ]}
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Ionicons
                  name="send"
                  size={24}
                  color={inputText.trim() ? '#FFFFFF' : colors.secondaryText}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.inputBackground }]}
              onPress={handleVoiceInput}
            >
              <Ionicons
                name={isRecording ? 'stop-circle-outline' : 'mic-outline'}
                size={24}
                color={isRecording ? colors.error : colors.primary}
              />
              <Text style={[styles.buttonText, { color: colors.text }]}>语音</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.inputBackground }]}
              onPress={handleTakePhoto}
            >
              <Ionicons name="camera-outline" size={24} color={colors.primary} />
              <Text style={[styles.buttonText, { color: colors.text }]}>拍照</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.inputBackground }]}
              onPress={handleUploadFile}
            >
              <Ionicons name="document-outline" size={24} color={colors.primary} />
              <Text style={[styles.buttonText, { color: colors.text }]}>文件</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.inputBackground }]}
              onPress={switchToVoiceMode}
            >
              <Ionicons name="radio-outline" size={24} color={colors.primary} />
              <Text style={[styles.buttonText, { color: colors.text }]}>录音模式</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minHeight: 40,
    maxHeight: 120,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  buttonText: {
    fontSize: 12,
    marginTop: 4,
  },
}); 