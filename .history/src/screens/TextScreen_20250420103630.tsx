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
  Text,
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

    // TODO: Send message to AI service
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice input
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
        <StatusBar showModeSwitch />
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
            <View style={styles.buttonsColumn}>
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
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Ionicons
                  name="send"
                  size={24}
                  color={inputText.trim() ? colors.primary : colors.secondaryText}
                />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.switchButton, { backgroundColor: colors.primary }]}
            onPress={switchToVoiceMode}
          >
            <Ionicons name="mic" size={22} color="#FFFFFF" />
            <View style={styles.switchButtonTextContainer}>
              <Text style={styles.switchButtonText}>切换到语音模式</Text>
            </View>
          </TouchableOpacity>
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    minHeight: 60,
    maxHeight: 120,
    fontSize: 16,
    marginRight: 8,
  },
  buttonsColumn: {
    justifyContent: 'space-between',
    height: 60,
    paddingVertical: 4,
  },
  button: {
    padding: 8,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 20,
  },
  switchButtonTextContainer: {
    marginLeft: 8,
  },
  switchButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
}); 