import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../theme';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? colors.primary : colors.card,
            borderBottomRightRadius: isUser ? 0 : 16,
            borderBottomLeftRadius: isUser ? 16 : 0,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: isUser ? colors.background : colors.text,
            },
          ]}
        >
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
}); 