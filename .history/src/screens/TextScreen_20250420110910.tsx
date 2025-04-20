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
import { Text } from '../components/Text';

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

    // TODO: Send message to AI service
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice input
  };

  const handleTakePhoto = () => {
    // TODO: Implement photo capture
    console.log('Take photo');
  };

  const handleUploadFile = () => {
    // TODO: Implement file upload
    console.log('Upload file');
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
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          style={styles.messageList}
          inverted
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
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.inputBackground }]}
              onPress={handleVoiceInput}
            >
              <Ionicons
                name={isRecording ? 'stop-circle-outline' : 'mic-outline'}
                size={24}
                color={colors.primary}
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