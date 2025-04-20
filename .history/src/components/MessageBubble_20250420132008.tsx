import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Text } from './Text';
import { Message } from '../types';

type MessageBubbleProps = {
  message: Message;
  onRetry?: () => void;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry }) => {
  const { colors } = useTheme();
  const isUser = message.type === 'user';
  const hasError = message.status === 'error';

  return (
    <View
      style={[
        styles.container,
        {
          alignSelf: isUser ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? colors.primary : colors.inputBackground,
            borderBottomRightRadius: isUser ? 0 : 16,
            borderBottomLeftRadius: isUser ? 16 : 0,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: isUser ? '#FFFFFF' : colors.text,
            },
          ]}
        >
          {message.content}
        </Text>
      </View>
      
      {hasError && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh" size={16} color={colors.error} />
          <Text style={[styles.retryText, { color: colors.error }]}>重试</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 4,
    paddingRight: 8,
  },
  retryText: {
    fontSize: 12,
    marginLeft: 4,
  },
}); 