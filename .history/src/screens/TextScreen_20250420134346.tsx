import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from '../components/StatusBar';
import { MessageBubble } from '../components/MessageBubble';
import { useTheme } from '../theme/ThemeContext';
import { Message, RootStackParamList } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type TextScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Text'>;

export const TextScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<TextScreenNavigationProp>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      type: 'user',
      timestamp: Date.now(),
      status: 'sending',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // TODO: 发送消息到AI服务
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: '这是AI的回复示例',
        type: 'ai',
        timestamp: Date.now() + 1,
        status: 'sent',
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // TODO: 实现语音输入
  };

  const handleAttachment = () => {
    // TODO: 实现附件上传
    console.log('添加附件');
  };

  const handleCamera = () => {
    // TODO: 实现拍照功能
    console.log('打开相机');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar showModeSwitch />
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
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
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={colors.buttonText}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleVoiceInput}
            >
              <Ionicons
                name={isRecording ? 'stop-circle-outline' : 'mic-outline'}
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleCamera}
            >
              <Ionicons
                name="camera-outline"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleAttachment}
            >
              <Ionicons
                name="attach-outline"
                size={24}
                color={colors.primary}
              />
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
  messageListContent: {
    paddingTop: 10,
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
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    minHeight: 50,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    padding: 8,
  },
}); 