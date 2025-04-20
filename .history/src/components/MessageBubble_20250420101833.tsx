import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Message } from '../types';

type Props = {
  message: Message;
};

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const { colors } = useTheme();
  const isUser = message.type === 'user';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? colors.primary : colors.card,
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
      {message.status === 'error' && (
        <Text style={[styles.error, { color: '#FF3B30' }]}>
          发送失败，点击重试
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
}); 