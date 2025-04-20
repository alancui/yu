import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const Text: React.FC<TextProps> = ({ style, ...props }) => {
  const { colors } = useTheme();
  return <RNText style={[{ color: colors.text }, style]} {...props} />;
}; 